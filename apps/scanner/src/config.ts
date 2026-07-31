export type ScannerConfig = {
  clamdHost: string;
  clamdPort: number;
  maxFileBytes: number;
  port: number;
  scannerSecret: string;
  scanTimeoutMs: number;
};

function positiveInteger(value: string | undefined, fallback: number, name: string) {
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error(`${name} must be a positive integer.`);
  return parsed;
}

export function getScannerConfig(environment: NodeJS.ProcessEnv = process.env): ScannerConfig {
  const scannerSecret = environment.SCANNER_SECRET?.trim();
  if (!scannerSecret || scannerSecret.length < 16) throw new Error("SCANNER_SECRET must contain at least 16 characters.");
  return {
    clamdHost: environment.CLAMD_HOST?.trim() || "127.0.0.1",
    clamdPort: positiveInteger(environment.CLAMD_PORT, 3310, "CLAMD_PORT"),
    maxFileBytes: positiveInteger(environment.MAX_FILE_BYTES, 10 * 1024 * 1024, "MAX_FILE_BYTES"),
    port: positiveInteger(environment.PORT, 8080, "PORT"),
    scannerSecret,
    scanTimeoutMs: positiveInteger(environment.SCAN_TIMEOUT_MS, 45_000, "SCAN_TIMEOUT_MS"),
  };
}
