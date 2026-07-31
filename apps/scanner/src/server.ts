import { createScannerServer } from "./app.js";
import { ClamdScanner } from "./clamd.js";
import { getScannerConfig } from "./config.js";

const config = getScannerConfig();
const scanner = new ClamdScanner(config.clamdHost, config.clamdPort, config.scanTimeoutMs);
const server = createScannerServer({ maxFileBytes: config.maxFileBytes, scanner, secret: config.scannerSecret });

server.listen(config.port, "0.0.0.0", () => console.log(`QgritAI document scanner listening on port ${config.port}.`));

function shutdown() {
  server.close(error => {
    if (error) {
      console.error("Scanner shutdown failed.");
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
