const REQUIRED_VARS = ["DATABASE_URL"] as const;

const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

export interface Env {
  port: number;
  databaseUrl: string;
  allowedOrigin: string;
  logLevel: LogLevel;
}

function assertRequiredVars(source: NodeJS.ProcessEnv): void {
  const missing = REQUIRED_VARS.filter((key) => !source[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. Copy .env.example to .env and fill them in.`,
    );
  }
}

function parseLogLevel(value: string | undefined): LogLevel {
  if (value && (LOG_LEVELS as readonly string[]).includes(value)) {
    return value as LogLevel;
  }
  return "info";
}

function parsePort(value: string | undefined): number {
  const port = Number(value ?? 3000);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: "${value}". Must be an integer between 1 and 65535.`);
  }
  return port;
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  assertRequiredVars(source);

  return {
    port: parsePort(source["PORT"]),
    databaseUrl: source["DATABASE_URL"] as string,
    allowedOrigin: source["ALLOWED_ORIGIN"] ?? "http://localhost:5173",
    logLevel: parseLogLevel(source["LOG_LEVEL"]),
  };
}

export const env = loadEnv();
