import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import logger from "../utils/logger";

const isOffline = process.env.IS_OFFLINE === 'true';
const endpoint = isOffline ? 'http://localhost:4566' : undefined;

const client = new S3Client({
    endpoint,
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
    },
    forcePathStyle: true
});

const BUCKET_NAME = process.env.S3_BUCKET || 'lastdance-lastdance-bucket';

async function ensureBucketExists() {
    try {
        await client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
        logger.info(`Bucket ${BUCKET_NAME} already exists`);
    } catch (error: any) {
        if (error.name === 'NotFound') {
            logger.info(`Creating bucket ${BUCKET_NAME}...`);
            await client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
            logger.info(`Bucket ${BUCKET_NAME} created successfully`);
        } else {
            logger.error(`Error checking/creating bucket ${BUCKET_NAME}:`, error);
            throw error;
        }
    }
}

// Initialize bucket when module is loaded
if (isOffline) {
    ensureBucketExists().catch(error => {
        logger.error('Fatal error initializing bucket:', error);
        process.exit(1);
    });
}

export async function uploadImage(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: mimeType,
        });

        await client.send(command);
        return isOffline
            ? `http://localhost:4566/${BUCKET_NAME}/${fileName}`
            : `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
    } catch (error) {
        logger.error('Error uploading image:', error);
        throw error;
    }
}
