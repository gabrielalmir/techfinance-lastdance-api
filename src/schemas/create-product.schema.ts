import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price_in_cents: z.coerce.number().min(1, "Price is required"),
    category: z.string().min(1, "Category is required"),
    image: z.string().min(1, "Image is required"),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;
