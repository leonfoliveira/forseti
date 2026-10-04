#!/bin/sh

set -e

esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

cat > /usr/share/nginx/html/config.js <<JS
window.__ENV__ = {
  VERSION: "$(esc "${VERSION:-}")",
  HTTP_URL: "$(esc "${HTTP_URL:-}")",
  WS_URL: "$(esc "${WS_URL:-}")"
};
JS

exec nginx -g "daemon off;"
