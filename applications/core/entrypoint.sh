#!/bin/sh

set -e

SECRET_FILES="AWS_ACCESS_KEY_FILE AWS_SECRET_KEY_FILE DB_PASSWORD_FILE REDIS_PASSWORD_FILE"

for secret_file in $SECRET_FILES; do
    eval "file_path=\$$secret_file"
    
    if [ -n "$file_path" ] && [ -f "$file_path" ]; then
        target_var="${secret_file%_FILE}"
        secret_val=$(cat "$file_path")
        export "$target_var=$secret_val"
    fi
done

echo "Starting application..."
exec java -javaagent:opentelemetry-javaagent.jar -jar core.jar
