import env from "@/config/env";
import {
    DynamoDBClient,
    DynamoDBClientConfig
} from "@aws-sdk/client-dynamodb";
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";

const isOffline = env.IS_OFFLINE;
const region = env.AWS_REGION;

const localstackConfig = {
    endpoint: "http://localhost:4566",
    credentials: {
        accessKeyId: "test",
        secretAccessKey: "test",
    },
    forcePathStyle: true,
}

const config: DynamoDBClientConfig = isOffline ? localstackConfig : { region };

export const ddbClient = new DynamoDBClient(config);

const s3Config: S3ClientConfig = isOffline ? {
    ...localstackConfig,
    forcePathStyle: true,
} : { region, endpoint: `https://s3.${env.AWS_REGION}.amazonaws.com` };

export const s3Client = new S3Client(s3Config);
