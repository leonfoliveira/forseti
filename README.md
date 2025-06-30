# Judge 

![GitHub release (latest by date)](https://img.shields.io/github/v/release/leonfoliveira/judge)

A fullstack application for running programming contests

## Production

### Requirements

- Unix based system or wsl2
- [docker](https://www.docker.com/)

### Installation

1. Download the latest [release](https://github.com/leonfoliveira/judge/releases).
2. Unzip it
3. Run `install.sh`

### Running

1. Start swarm
```shell
docker swarm init --advertise-addr <MANAGER-IP>
```

2. Deploy stack
```shell
docker stack deploy -c stack.yml <STACK-NAME>
```