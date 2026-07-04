import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // drizzle-kit runs outside the app; direct env read is acceptable here
    url: process.env.DATABASE_URL ?? '',
  },
});