import { zValidator } from "@hono/zod-validator";
import crypto from "crypto";
import { Hono } from "hono";
import { cors } from 'hono/cors';
import { Product } from "../models/Product";
import { createProductSchema } from "../schemas/create-product.schema";
import { createProduct, deleteProduct, getProduct, listProducts } from "../services/dynamodb";
import { uploadImage } from "../services/s3";
import logger from "../utils/logger";

const products = new Hono();

function processBase64Image(base64String: string): { buffer: Buffer, mimeType: string, fileName: string } {
    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `image-${Date.now()}.${extension}`;

    return { buffer, mimeType, fileName };
}

products.use('/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
}));

products.get("/", async (c) => {
    const list = await listProducts();
    return c.json(list);
});

products.get("/:id", async (c) => {
    const id = c.req.param("id");
    const product = await getProduct(id);
    return product ? c.json(product) : c.notFound();
});

products.post("/",
    zValidator('json', createProductSchema),
    async (c) => {
        try {
            const { name, description, price_in_cents, category, image } = c.req.valid("json");

            logger.info(`Processing product: ${name} with image data`);

            let imageUrl = '';
            try {
                const { buffer, mimeType, fileName } = processBase64Image(image);

                logger.info(`Image size: ${buffer.length} bytes, type: ${mimeType}`);

                imageUrl = await uploadImage(buffer, fileName, mimeType);
                logger.info(`Image uploaded successfully to: ${imageUrl}`);
            } catch (error) {
                logger.error('Error processing image:', error);
                return c.json({ error: 'Failed to process image. Make sure it is a valid base64 string.' }, 400);
            }

            if (!imageUrl) {
                return c.json({ error: 'Failed to upload image' }, 500);
            }

            const product: Product = {
                id: crypto.randomUUID(),
                name: String(name),
                description: String(description),
                image_url: imageUrl,
                price_in_cents: Number(price_in_cents),
                category: String(category),
                created_at: new Date().toISOString(),
            };

            logger.info(`Creating product in database: ${product.id}`);
            await createProduct(product);
            return c.json(product, 201);
        } catch (error) {
            logger.error('Error creating product:', error);
            return c.json({ error: 'Failed to create product' }, 500);
        }
    });

products.delete("/:id", async (c) => {
    const id = c.req.param("id");
    await deleteProduct(id);
    return c.body(null, 204);
});

export default products;
