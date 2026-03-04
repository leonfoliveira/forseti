class DockerNode:
    def __init__(self, node):
        self.node = node

    @property
    def id(self):
        return self.node.id

    @property
    def hostname(self):
        return self.node.attrs["Description"]["Hostname"]

    @property
    def address(self):
        return self.node.attrs["Status"]["Addr"]

    @property
    def role(self):
        return self.node.attrs["Spec"]["Role"]

    @property
    def state(self):
        return self.node.attrs["Status"]["State"]

    @property
    def availability(self):
        return self.node.attrs["Spec"]["Availability"]
