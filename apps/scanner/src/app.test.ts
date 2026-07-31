import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createScannerServer } from "./app.js";
import type { MalwareScanner, ScanVerdict } from "./clamd.js";

const servers: ReturnType<typeof createScannerServer>[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve()))));
});

async function start(verdict: ScanVerdict = { clean: true }) {
  const scanner: MalwareScanner = { healthy: vi.fn(async () => true), scan: vi.fn(async content => { for await (const _ of content) void _; return verdict; }) };
  const server = createScannerServer({ maxFileBytes: 32, scanner, secret: "scanner-secret-value" });
  servers.push(server);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address() as AddressInfo;
  return { baseUrl: `http://127.0.0.1:${port}`, scanner };
}

describe("scanner HTTP service", () => {
  it("reports ClamAV health without exposing configuration", async () => {
    const { baseUrl } = await start();
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("requires the configured bearer secret", async () => {
    const { baseUrl, scanner } = await start();
    const response = await fetch(`${baseUrl}/scan`, { method: "POST", body: "clean" });
    expect(response.status).toBe(401);
    expect(scanner.scan).not.toHaveBeenCalled();
  });

  it("returns the scanner verdict for an authorized file", async () => {
    const { baseUrl } = await start({ clean: false, signature: "Eicar-Signature" });
    const response = await fetch(`${baseUrl}/scan`, { method: "POST", headers: { Authorization: "Bearer scanner-secret-value", "Content-Type": "text/plain" }, body: "test file" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ clean: false, signature: "Eicar-Signature" });
  });

  it("rejects files larger than the configured limit", async () => {
    const { baseUrl, scanner } = await start();
    const response = await fetch(`${baseUrl}/scan`, { method: "POST", headers: { Authorization: "Bearer scanner-secret-value" }, body: "x".repeat(33) });
    expect(response.status).toBe(413);
    expect(scanner.scan).not.toHaveBeenCalled();
  });
});
