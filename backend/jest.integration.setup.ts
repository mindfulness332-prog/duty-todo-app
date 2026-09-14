// Matches the docker-compose.yml defaults at the project root — override with
// a real DATABASE_URL env var if your local Postgres is configured differently.
process.env["DATABASE_URL"] ??= "postgres://asm:asm@localhost:5432/asm_duties";
process.env["LOG_LEVEL"] ??= "error";
