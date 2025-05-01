import { serve } from '@hono/node-server';
import { app } from './app';

serve(app, ({ port }) => {
    console.log(`Server is running on port ${port}`);
});
