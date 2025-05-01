import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/handler.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    minify: false,
    sourcemap: true,
    target: 'node20',
    platform: 'node',
    outDir: 'dist',
    noExternal: ['@aws-sdk/*', 'hono', 'zod'],
});
