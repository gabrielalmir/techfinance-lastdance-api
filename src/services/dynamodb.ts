import { CreateTableCommand, DescribeTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Product } from "../models/Product";
import logger from "../utils/logger";

const isOffline = process.env.IS_OFFLINE === 'true';
const endpoint = isOffline ? 'http://localhost:4566' : undefined;

const client = new DynamoDBClient({
    endpoint,
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
    }
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'lastdance-lastdance-products';

async function ensureTableExists() {
    try {
        await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
        logger.info(`Table ${TABLE_NAME} already exists`);
    } catch (error: any) {
        if (error.name === 'ResourceNotFoundException') {
            logger.info(`Creating table ${TABLE_NAME}...`);
            await client.send(new CreateTableCommand({
                TableName: TABLE_NAME,
                AttributeDefinitions: [
                    { AttributeName: 'id', AttributeType: 'S' }
                ],
                KeySchema: [
                    { AttributeName: 'id', KeyType: 'HASH' }
                ],
                BillingMode: 'PAY_PER_REQUEST'
            }));
            logger.info(`Table ${TABLE_NAME} created successfully`);
        } else {
            logger.error(`Error checking/creating table ${TABLE_NAME}:`, error);
            throw error;
        }
    }
}

// Initialize table when module is loaded
if (isOffline) {
    ensureTableExists().catch(error => {
        logger.error('Fatal error initializing table:', error);
        process.exit(1);
    });
}

export async function listProducts(): Promise<Product[]> {
    try {
        const command = new ScanCommand({
            TableName: TABLE_NAME,
        });

        const response = await docClient.send(command);
        return response.Items as Product[];
    } catch (error) {
        logger.error('Error listing products:', error);
        throw error;
    }
}

export async function getProduct(id: string): Promise<Product | null> {
    try {
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: { id },
        });

        const response = await docClient.send(command);
        return response.Item as Product || null;
    } catch (error) {
        logger.error('Error getting product:', error);
        throw error;
    }
}

export async function createProduct(product: Product): Promise<void> {
    try {
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: product,
        });

        await docClient.send(command);
    } catch (error) {
        logger.error('Error creating product:', error);
        throw error;
    }
}

export async function deleteProduct(id: string): Promise<void> {
    try {
        const command = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id },
        });

        await docClient.send(command);
    } catch (error) {
        logger.error('Error deleting product:', error);
        throw error;
    }
}
