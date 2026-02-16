import path from 'node:path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

export default defineConfig({
    schema: path.join(__dirname, 'schema.prisma'),
    datasource: {
        url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
    },
});
