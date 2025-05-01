import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ZodError } from 'zod';
import products from './routes/products';
import logger from './utils/logger';

const app = new Hono();

// CORS middleware
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
}));

// Logging middleware
app.use('*', async (c, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;

    logger.info({
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        duration: `${duration}ms`,
        userAgent: c.req.header('user-agent'),
        ip: c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip'),
    });
});

// Error handling
app.onError((err, c) => {
    logger.error({
        error: err.message,
        stack: err.stack,
        path: c.req.path,
        method: c.req.method
    });

    if (err instanceof ZodError) {
        return c.json({ error: err.errors }, 400);
    }

    return c.json({ error: "Internal Server Error" }, 500);
});

// Health check endpoint
app.get('/health', (c) => {
    return c.json({ status: 'ok' });
});

// Routes
app.route("/produtos", products);

export { app };
