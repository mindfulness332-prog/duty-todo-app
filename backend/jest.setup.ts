// Ensures backend/src/config/env.ts can load without a real .env file during unit tests.
process.env["DATABASE_URL"] ??= "postgres://test:test@localhost:5432/test_db";
process.env["LOG_LEVEL"] ??= "error";
