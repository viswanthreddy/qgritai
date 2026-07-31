import { timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { MalwareScanner } from "./clamd.js";

class PayloadTooLargeError extends Error {}

type ScannerServerOptions = {
  maxFileBytes: number;
  scanner: MalwareScanner;
  secret: string;
};

function authorized(header: string | undefined, secret: string) {
  const actual = Buffer.from(header ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return actual.byteLength === expected.byteLength && timingSafeEqual(actual, expected);
}

function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

async function* limitedBody(request: IncomingMessage, maximumBytes: number) {
  let received = 0;
  for await (const chunk of request) {
    const bytes = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    received += bytes.byteLength;
    if (received > maximumBytes) throw new PayloadTooLargeError("File exceeds scanner limit.");
    yield bytes;
  }
  if (received === 0) throw new Error("Empty files cannot be scanned.");
}

export function createScannerServer({ maxFileBytes, scanner, secret }: ScannerServerOptions) {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://scanner.internal");
    if (request.method === "GET" && url.pathname === "/health") {
      const healthy = await scanner.healthy();
      return json(response, healthy ? 200 : 503, { status: healthy ? "ok" : "unavailable" });
    }
    if (request.method !== "POST" || url.pathname !== "/scan") return json(response, 404, { error: "Not found." });
    if (!authorized(request.headers.authorization, secret)) return json(response, 401, { error: "Unauthorized." });

    const declaredLength = Number(request.headers["content-length"] ?? 0);
    if (Number.isFinite(declaredLength) && declaredLength > maxFileBytes) return json(response, 413, { error: "File exceeds scanner limit." });
    try {
      const verdict = await scanner.scan(limitedBody(request, maxFileBytes));
      return json(response, 200, verdict);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) return json(response, 413, { error: error.message });
      return json(response, 502, { error: "Malware scan failed." });
    }
  });
}
