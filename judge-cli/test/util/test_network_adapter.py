import pytest
from unittest.mock import patch

from cli.util.network_adapter import NetworkAdapter


BASE_PATH = "cli.util.network_adapter"


class TestNetworkAdapter:
    @pytest.fixture(autouse=True)
    def socket(self):
        with patch(f"{BASE_PATH}.socket") as mock:
            yield mock

    @pytest.fixture
    def sut(self):
        yield NetworkAdapter()

    def test_get_ip_address_success(self, sut, socket):
        mock_socket_instance = socket.socket.return_value
        mock_socket_instance.getsockname.return_value = (
            "192.168.1.100", 12345)
        ip_address = sut.get_ip_address()
        assert ip_address == "192.168.1.100"

    def test_get_ip_address_exception(self, sut, socket):
        mock_socket_instance = socket.socket.return_value
        mock_socket_instance.connect.side_effect = Exception("Network error")
        ip_address = sut.get_ip_address()
        assert ip_address == "127.0.0.1"
