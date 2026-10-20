#!/bin/sh

set -e

esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

cat > /usr/share/nginx/html/config.js <<JS
window.__ENV__ = {
  VERSION: "$(esc "${VERSION:-}")",
  API_URL: "$(esc "${API_URL:-}")",
  OTEL_URL: "$(esc "${OTEL_URL:-}")"
};
JS

exec nginx -g "daemon off;"
