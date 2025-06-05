# Judge 

![GitHub release (latest by date)](https://img.shields.io/github/v/release/leonfoliveira/judge)

A fullstack application for running programming contests

## Production

### Requirements

- [docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)

### Installation

1. Download the latest [release](https://github.com/leonfoliveira/judge/releases).
2. Unzip it
3. Run `docker load -i judge-{version}.tar`

### Running

1. Set environment variables

| **Variable** | **Default** |
|---|---|
| POSTGRES_USER | judge |
| POSTGRES_PASSWORD | judge |
| REDIS_PASSWORD | judge |
| ALLOWED_ORIGINS | http://localhost:3000 |
| JWT_SECRET | judge |
| ROOT_PASSWORD | judge |
| NEXT_PUBLIC_API_URL | http://localhost:8080 |

2. Run `docker compose up`

## Pages

| **Page** | **Description** |
|---|---|
| /root | Root dashboard |
| /contests/{id} | Contest dashboard |