import { Handler } from 'aws-lambda';
import { handle } from 'hono/aws-lambda';
import { app } from './app';

export const handler: Handler = handle(app);
