# Use Alpine 3.22.1 (latest stable version)
FROM alpine:3.22.1

# Create a restricted user for code execution FIRST (before any cleanup)
RUN addgroup -g 1001 autojudge && \
    adduser -D -u 1001 -G autojudge -s /bin/sh -h /app autojudge

# Install latest available GCC version and essential tools
RUN apk add --no-cache \
    # Install latest GCC (will be 14.x in Alpine 3.22.1)
    gcc \
    g++ \
    musl-dev \
    libstdc++ \
    libgcc \
    # Essential system tools
    coreutils

# Cleanup unnecessary files to minimize image size and attack surface
RUN rm -rf /var/cache/apk/* \
           /usr/share/man/* \
           /usr/share/doc/* \
           /usr/lib/pkgconfig/* \
           /etc/crontabs/* \
           /etc/periodic/* \
           /usr/share/terminfo/* \
           /usr/share/tabset/* && \
    # Remove potentially dangerous binaries (but keep essential ones)
    rm -f /bin/su \
          /usr/bin/passwd \
          /usr/bin/chsh \
          /usr/bin/chfn \
          /sbin/getty \
          /usr/bin/ssh* \
          /usr/sbin/ssh* 2>/dev/null || true

# Create directory structure with proper permissions
RUN mkdir -p /app /tmp-limited && \
    chown autojudge:autojudge /app && \
    chmod 755 /app && \
    chmod 1777 /tmp-limited && \
    chown root:root /tmp-limited

# Set working directory
WORKDIR /app

# Set security-focused environment variables
ENV HOME=/app \
    USER=autojudge \
    TMPDIR=/tmp-limited \
    PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    RLIMIT_CORE=0 \
    CXXFLAGS="-O2 -Wall -Wextra -fstack-protector-strong -D_FORTIFY_SOURCE=2 -fPIE" \
    LDFLAGS="-Wl,-z,relro,-z,now"

# Switch to non-root user
USER autojudge

# Health check to ensure container is responsive and can execute commands
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD echo "healthy" | cat > /dev/null || exit 1

# Default command that keeps container alive for exec commands
CMD ["sleep", "infinity"]

# Security labels and metadata
LABEL security.scan="required" \
      security.user="autojudge" \
      security.network="isolated" \
      security.capabilities="minimal" \
      description="Secure C++ compilation environment with GCC from Alpine 3.22.1" \
      alpine.version="3.22.1" \
      version="4.1"
