#!/bin/sh
set -eu

freshclam --config-file=/etc/clamav/freshclam.conf
clamd --config-file=/etc/clamav/clamd.conf &
clamd_pid=$!

(
  while sleep 21600; do
    freshclam --config-file=/etc/clamav/freshclam.conf || true
  done
) &
freshclam_pid=$!
app_pid=""

cleanup() {
  if [ -n "$app_pid" ]; then
    kill "$app_pid" 2>/dev/null || true
  fi
  kill "$clamd_pid" 2>/dev/null || true
  kill "$freshclam_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

attempt=0
until printf 'zPING\0' | nc -w 1 127.0.0.1 3310 | grep -q PONG; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 120 ]; then
    echo "ClamAV did not become ready." >&2
    exit 1
  fi
  sleep 1
done

node /app/dist/server.js &
app_pid=$!
wait "$app_pid"
