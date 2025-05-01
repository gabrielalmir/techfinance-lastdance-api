import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    PORT: z.number().default(3000),
    AWS_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string().default('test'),
    AWS_SECRET_ACCESS_KEY: z.string().default('test'),
    IS_OFFLINE: z.coerce.boolean().default(false),
    S3_BUCKET: z.string().default('lastdance-lastdance-bucket'),
    DYNAMODB_TABLE: z.string().default('lastdance-lastdance-products'),
});

const env = envSchema.parse(process.env);

export default env;
