FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/scanner/package.json apps/scanner/package.json
RUN corepack enable && pnpm install --filter @qgritai/document-scanner... --frozen-lockfile
COPY apps/scanner apps/scanner
RUN pnpm --filter @qgritai/document-scanner build

FROM clamav/clamav-debian:1.4 AS runtime
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl netcat-openbsd nodejs tini \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /run/clamav /var/lib/clamav \
  && chown -R clamav:clamav /run/clamav /var/lib/clamav
WORKDIR /app
COPY --from=build /app/apps/scanner/dist ./dist
COPY apps/scanner/clamd.conf /etc/clamav/clamd.conf
COPY apps/scanner/freshclam.conf /etc/clamav/freshclam.conf
COPY apps/scanner/docker-entrypoint.sh /usr/local/bin/qgritai-scanner-entrypoint
RUN chmod 0555 /usr/local/bin/qgritai-scanner-entrypoint
ENV CLAMD_HOST=127.0.0.1 CLAMD_PORT=3310 MAX_FILE_BYTES=10485760 PORT=8080 SCAN_TIMEOUT_MS=45000
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 CMD curl --fail --silent --output /dev/null http://127.0.0.1:8080/health || exit 1
ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/qgritai-scanner-entrypoint"]
