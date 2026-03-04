from cli.composition import get_docker_client
from cli.util.docker.docker_node import DockerNode


class DockerSwarm:
    def __init__(self) -> None:
        self.docker_client = get_docker_client()

    @property
    def is_active(self) -> bool:
        return self.local_node_state == "active"

    @property
    def local_node_state(self) -> str:
        docker_info = self.docker_client.info()
        return docker_info.get("Swarm", {}).get("LocalNodeState", "inactive")

    @property
    def manager_address(self) -> str:
        node_id = self.docker_client.info()["Swarm"]["NodeID"]
        node = self.docker_client.nodes.get(node_id)
        return node.attrs["ManagerStatus"]["Addr"]

    @property
    def manager_join_token(self) -> str:
        return self.docker_client.swarm.attrs["JoinTokens"]["Manager"]

    @property
    def worker_join_token(self) -> str:
        return self.docker_client.swarm.attrs["JoinTokens"]["Worker"]

    @property
    def nodes(self) -> list[DockerNode]:
        return [DockerNode(node) for node in self.docker_client.nodes.list()]

    def init(self, advertise_addr: str) -> None:
        self.docker_client.swarm.init(advertise_addr=advertise_addr)

    def create_secret(self, name: str, data: str) -> None:
        self.docker_client.secrets.create(name=name, data=data)

    def join(self, token: str, manager_address: str) -> None:
        self.docker_client.swarm.join(
            remote_addrs=[manager_address], join_token=token)

    def leave(self) -> None:
        self.docker_client.swarm.leave(force=True)
