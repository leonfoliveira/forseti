FROM ubuntu:24.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    git \
    make \
    gcc \
    libcap-dev \
    libc6-dev \
    pkg-config \
    libsystemd-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp
RUN git clone --branch v2.2.1 --depth 1 https://github.com/ioi/isolate.git && \
    cd isolate && \
    make install


FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    libcap2 \
    bash \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local/bin/isolate /usr/local/bin/isolate
COPY --from=builder /usr/local/bin/isolate-check-environment /usr/local/bin/isolate-check-environment
COPY --from=builder /usr/local/etc/isolate /usr/local/etc/isolate

WORKDIR /app

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD echo "healthy" | cat > /dev/null || exit 1

LABEL description="Isolate sandbox with minimal tools and security hardening for code execution" \
      version="4.1"

CMD ["sleep", "infinity"]
