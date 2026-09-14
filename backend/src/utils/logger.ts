import { env } from "../config/env";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogMeta = Record<string, unknown>;

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel): boolean {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[env.logLevel];
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  if (!shouldLog(level)) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    process.stderr.write(`${line}\n`);
  } else {
    process.stdout.write(`${line}\n`);
  }
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => write("debug", message, meta),
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  error: (message: string, meta?: LogMeta) => write("error", message, meta),
};
