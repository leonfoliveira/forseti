#!/bin/sh

if [ -f "$DB_PASSWORD_FILE" ]; then
  export DB_PASSWORD=$(cat "$DB_PASSWORD_FILE")
fi

exec /run.sh
