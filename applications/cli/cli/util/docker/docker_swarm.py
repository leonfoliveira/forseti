from cli.composition import docker_client
from cli.util.docker.docker_node import DockerNode


class DockerSwarm:
    @property
    def is_active(self) -> bool:
        return self.local_node_state == "active"

    @property
    def local_node_state(self) -> str:
        docker_info = docker_client.info()
        return docker_info.get("Swarm", {}).get("LocalNodeState", "inactive")

    @property
    def manager_address(self) -> str:
        node_id = docker_client.info()["Swarm"]["NodeID"]
        node = docker_client.nodes.get(node_id)
        return node.attrs["ManagerStatus"]["Addr"]

    @property
    def manager_join_token(self) -> str:
        return docker_client.swarm.attrs["JoinTokens"]["Manager"]

    @property
    def worker_join_token(self) -> str:
        return docker_client.swarm.attrs["JoinTokens"]["Worker"]

    @property
    def nodes(self) -> list[DockerNode]:
        return [DockerNode(node) for node in docker_client.nodes.list()]

    def init(self, advertise_addr: str) -> None:
        docker_client.swarm.init(advertise_addr=advertise_addr)

    def create_secret(self, name: str, data: str) -> None:
        docker_client.secrets.create(name=name, data=data)

    def join(self, token: str, manager_address: str) -> None:
        docker_client.swarm.join(remote_addrs=[manager_address], join_token=token)

    def leave(self) -> None:
        docker_client.swarm.leave(force=True)
