# QgritAI document scanner

This service keeps untrusted client uploads outside the application until ClamAV returns a clean verdict. It implements the provider-neutral HTTP contract consumed by the protected Next.js document-scan worker.

## Contract

- `GET /health` returns `200 {"status":"ok"}` only when `clamd` responds.
- `POST /scan` accepts the file as the raw request body and requires `Authorization: Bearer <SCANNER_SECRET>`.
- A successful scan returns either `{"clean":true}` or `{"clean":false,"signature":"..."}`.
- Empty, oversized, unauthorized, and failed scans never return a clean verdict.

The service intentionally does not persist request bodies or log file names, contents, secrets, or signatures.

## Container

Build from the repository root so the pnpm workspace lockfile is available:

```bash
docker build -f apps/scanner/Dockerfile -t qgritai/document-scanner .
docker run --rm -p 8080:8080 -e SCANNER_SECRET='<random-value-at-least-16-characters>' qgritai/document-scanner
```

The runtime is based on the official ClamAV 1.4 image, updates its bundled signatures before accepting traffic, and refreshes them every six hours. Allocate at least 4 GB RAM. The signature database is best mounted on persistent storage at `/var/lib/clamav` to reduce cold-start downloads.

Configuration:

| Variable | Default | Purpose |
| --- | --- | --- |
| `SCANNER_SECRET` | required | Bearer secret shared only with the web worker |
| `PORT` | `8080` | HTTP listener |
| `MAX_FILE_BYTES` | `10485760` | Maximum raw upload size; keep aligned with the web limit |
| `SCAN_TIMEOUT_MS` | `45000` | ClamAV connection and response timeout |
| `CLAMD_HOST` | `127.0.0.1` | ClamAV daemon host |
| `CLAMD_PORT` | `3310` | ClamAV daemon port |

In production, expose the HTTP service through TLS and preferably private ingress. Never expose the ClamAV TCP port. Rotate `SCANNER_SECRET` if either environment may have disclosed it.

## Development checks

```bash
pnpm --filter @qgritai/document-scanner typecheck
pnpm --filter @qgritai/document-scanner test
pnpm --filter @qgritai/document-scanner build
```

Use the standard EICAR test file only in an isolated non-production verification environment. Never use live malware.
