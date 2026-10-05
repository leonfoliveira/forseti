FROM forseti-sb-base:${VERSION:-latest}

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONPATH=/app \
    PYTHONIOENCODING=utf-8 \
    PYTHONUNBUFFERED=1

LABEL description="Isolate sandbox with minimal tools and security hardening for code execution with Python 3.11"
