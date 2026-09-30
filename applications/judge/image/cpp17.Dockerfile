FROM forseti-sb-base:${VERSION:-latest}

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    && rm -rf /var/lib/apt/lists/*

LABEL description="Isolate sandbox with minimal tools and security hardening for code execution with G++ 13"
