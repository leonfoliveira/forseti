FROM forseti-sb-base:${VERSION:-latest}

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-21-jdk \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk

LABEL description="Isolate sandbox with minimal tools and security hardening for code execution with OpenJDK 21"
