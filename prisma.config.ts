import process from 'node:process';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
    schema: 'server/database/schema.prisma',
    migrations: {
        path: 'server/database/migrations',
    },
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
