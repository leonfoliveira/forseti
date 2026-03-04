import pytest
from typer.testing import CliRunner
from cli.config import __build_date__, __git_commit__, __version__

from cli.cmd import app


class TestInit:
    @pytest.fixture
    def runner(self):
        return CliRunner()

    def test_version(self, runner):
        """Test that the version command outputs the correct version information"""
        result = runner.invoke(app, ["--version"])
        assert result.exit_code == 0
        version_str = (
            f"forseti version {__version__} "
            f"({__git_commit__[:8] if __git_commit__ != 'unknown' else 'unknown'}, "
            f"built {__build_date__})"
        )
        assert version_str in result.output
