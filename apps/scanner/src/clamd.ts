import { once } from "node:events";
import net from "node:net";

export type ScanVerdict = { clean: true } | { clean: false; signature: string };

export interface MalwareScanner {
  healthy(): Promise<boolean>;
  scan(content: AsyncIterable<Uint8Array>): Promise<ScanVerdict>;
}

function responseUntilNull(socket: net.Socket, timeoutMs: number) {
  return new Promise<string>((resolve, reject) => {
    let response = "";
    const timer = setTimeout(() => reject(new Error("ClamAV response timed out.")), timeoutMs);
    socket.on("data", chunk => {
      response += chunk.toString("utf8");
      if (response.includes("\0")) {
        clearTimeout(timer);
        resolve(response.slice(0, response.indexOf("\0")));
      }
    });
    socket.once("error", error => {
      clearTimeout(timer);
      reject(error);
    });
    socket.once("end", () => {
      if (!response.includes("\0")) {
        clearTimeout(timer);
        reject(new Error("ClamAV closed the connection without a complete response."));
      }
    });
  });
}

async function write(socket: net.Socket, data: Uint8Array) {
  if (!socket.write(data)) await once(socket, "drain");
}

export function parseClamdScanResponse(response: string): ScanVerdict {
  const normalized = response.trim();
  if (normalized.endsWith(": OK")) return { clean: true };
  const found = normalized.match(/:\s+(.+)\s+FOUND$/);
  if (found?.[1]) return { clean: false, signature: found[1].slice(0, 500) };
  throw new Error(`Unexpected ClamAV response: ${normalized.slice(0, 200)}`);
}

export class ClamdScanner implements MalwareScanner {
  constructor(private readonly host: string, private readonly port: number, private readonly timeoutMs: number) {}

  private async connect() {
    const socket = net.createConnection({ host: this.host, port: this.port });
    socket.setTimeout(this.timeoutMs, () => socket.destroy(new Error("ClamAV connection timed out.")));
    await once(socket, "connect");
    return socket;
  }

  async healthy() {
    let socket: net.Socket | undefined;
    try {
      socket = await this.connect();
      const responsePromise = responseUntilNull(socket, this.timeoutMs);
      await write(socket, Buffer.from("zPING\0"));
      return (await responsePromise).trim() === "PONG";
    } catch {
      return false;
    } finally {
      socket?.destroy();
    }
  }

  async scan(content: AsyncIterable<Uint8Array>) {
    const socket = await this.connect();
    try {
      const responsePromise = responseUntilNull(socket, this.timeoutMs);
      await write(socket, Buffer.from("zINSTREAM\0"));
      for await (const chunk of content) {
        if (chunk.byteLength === 0) continue;
        const length = Buffer.allocUnsafe(4);
        length.writeUInt32BE(chunk.byteLength);
        await write(socket, length);
        await write(socket, chunk);
      }
      await write(socket, Buffer.alloc(4));
      return parseClamdScanResponse(await responsePromise);
    } finally {
      socket.destroy();
    }
  }
}
