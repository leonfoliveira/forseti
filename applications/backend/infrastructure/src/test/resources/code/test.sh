#!/bin/bash

INPUT="1"
TIME="1.0"
WALL_TIME="2.0"
MEM="1048576"

# C++17

echo "================================"
echo "C++ 17"
echo "================================"

docker run --privileged -d --name forseti-sb-cpp17 forseti-sb-cpp17:latest sleep infinity > /dev/null

docker exec forseti-sb-cpp17 isolate --init > /dev/null

FILES=(
    accepted.cpp
    memory_limit_exceeded.cpp
    runtime_error.cpp
    time_limit_exceeded.cpp
)

for FILE in "${FILES[@]}"; do
    docker cp "./cpp17/${FILE}" forseti-sb-cpp17:/var/local/lib/isolate/0/box/ > /dev/null
done

for FILE in "${FILES[@]}"; do
    BASENAME=$(basename "$FILE" .cpp)
    docker exec forseti-sb-cpp17 g++ -o "/var/local/lib/isolate/0/box/$BASENAME" -O2 -std=c++17 "/var/local/lib/isolate/0/box/$BASENAME.cpp" > /dev/null
done

for FILE in "${FILES[@]}"; do
    BASENAME=$(basename "$FILE" .cpp)
    echo $INPUT | docker exec -i forseti-sb-cpp17 isolate --box-id=0 --silent --processes=64 --time=$TIME --wall-time=$WALL_TIME --mem=$MEM --meta=/tmp/meta --run -- "/box/$BASENAME" > /tmp/stdout 2> /tmp/stderr

    echo "$FILE"
    echo ""
    docker exec forseti-sb-cpp17 cat /tmp/meta
    echo ""
    echo "stdout: $(cat /tmp/stdout)"
    echo "stderr: $(cat /tmp/stderr)"
    echo "================================"
done

docker rm -f forseti-sb-cpp17 > /dev/null

# Java 21

echo "Java 21"
echo "================================"

docker run --privileged -d --name forseti-sb-java21 forseti-sb-java21:latest sleep infinity > /dev/null

docker exec forseti-sb-java21 isolate --init > /dev/null

FILES=(
    Accepted.java
    MemoryLimitExceeded.java
    RuntimeError.java
    TimeLimitExceeded.java
)

for FILE in "${FILES[@]}"; do
    docker cp "./java21/${FILE}" forseti-sb-java21:/var/local/lib/isolate/0/box/ > /dev/null
done

for FILE in "${FILES[@]}"; do
    BASENAME=$(basename "$FILE" .java)
    docker exec forseti-sb-java21 javac "/var/local/lib/isolate/0/box/$BASENAME.java" -d "/var/local/lib/isolate/0/box/" > /dev/null
done

for FILE in "${FILES[@]}"; do
    BASENAME=$(basename "$FILE" .java)

    echo $INPUT | docker exec -i forseti-sb-java21 sh -c "isolate --box-id=0 --silent --processes=64 --time=$TIME --wall-time=$WALL_TIME --mem=$MEM --meta=/tmp/meta --run -- /usr/lib/jvm/java-21-openjdk-amd64/bin/java \$JAVA_OPTS -cp /box $BASENAME" > /tmp/stdout 2> /tmp/stderr

    echo "$FILE"
    echo ""
    docker exec forseti-sb-java21 cat /tmp/meta
    echo ""
    echo "stdout: $(cat /tmp/stdout)"
    echo "stderr: $(cat /tmp/stderr)"
    echo "================================"
done

docker rm -f forseti-sb-java21 > /dev/null

# Node 22

echo "Node 22"
echo "================================"

docker run --privileged -d --name forseti-sb-node22 forseti-sb-node22:latest sleep infinity > /dev/null

docker exec forseti-sb-node22 isolate --init > /dev/null

FILES=(
    accepted.js
    memory_limit_exceeded.js
    runtime_error.js
    time_limit_exceeded.js
)

for FILE in "${FILES[@]}"; do
    docker cp "./node22/${FILE}" forseti-sb-node22:/var/local/lib/isolate/0/box/ > /dev/null
done

for FILE in "${FILES[@]}"; do
    BASENAME=$(basename "$FILE" .js)
    echo $INPUT | docker exec -i forseti-sb-node22 isolate --box-id=0 --silent --processes=64 --time=$TIME --wall-time=$WALL_TIME --mem=$MEM --meta=/tmp/meta --run -- /usr/bin/node /box/"$BASENAME".js > /tmp/stdout 2> /tmp/stderr

    echo "$FILE"
    echo "meta:"
    docker exec forseti-sb-node22 cat /tmp/meta
    echo ""
    echo "stdout: $(cat /tmp/stdout)"
    echo "stderr: $(cat /tmp/stderr)"
    echo "================================"
done

docker rm -f forseti-sb-node22 > /dev/null

# Python 3.12

echo "Python 3.12"
echo "================================"

docker run --privileged -d --name forseti-sb-python312 forseti-sb-python312:latest sleep infinity > /dev/null

docker exec forseti-sb-python312 isolate --init > /dev/null

FILES=(
    accepted.py
    memory_limit_exceeded.py
    runtime_error.py
    time_limit_exceeded.py
)

for FILE in "${FILES[@]}"; do
    docker cp "./python312/${FILE}" forseti-sb-python312:/var/local/lib/isolate/0/box/ > /dev/null
done

for FILE in "${FILES[@]}"; do
    BASENAME=$(basename "$FILE" .py)
    echo $INPUT | docker exec -i forseti-sb-python312 isolate --box-id=0 --silent --processes=64 --time=$TIME --wall-time=$WALL_TIME --mem=$MEM --meta=/tmp/meta --run -- /usr/bin/python3 /box/"$BASENAME".py > /tmp/stdout 2> /tmp/stderr

    echo "$FILE"
    echo "meta:"
    docker exec forseti-sb-python312 cat /tmp/meta
    echo ""
    echo "stdout: $(cat /tmp/stdout)"
    echo "stderr: $(cat /tmp/stderr)"
    echo "================================"
done

docker rm -f forseti-sb-python312 > /dev/null
