import struct
from unittest.mock import MagicMock, patch

import pytest

from autojudge.sandbox.docker_sandbox_container import DockerSandboxContainer
from autojudge.sandbox.language_config import SubmissionLanguage
from autojudge.sandbox.models import IsolateMeta, RunResult
from autojudge.schema.submission_schema import SubmissionSchema


@pytest.fixture
def submission():
    return SubmissionSchema(
        submissionId="sub-1",
        language=SubmissionLanguage.PYTHON_312,
        codeId="code-1",
        codeFilename="main.py",
        timeLimitMs=1000,
        memoryLimitMb=128,
        testCasesId="tc-1",
    )


@pytest.fixture
def docker_client():
    with patch(
        "autojudge.sandbox.docker_sandbox_container.docker_client"
    ) as client:
        yield client


@pytest.fixture
def sandbox(submission, docker_client, tmp_path):
    code = tmp_path / "code"
    code.write_text("print(1)")
    return DockerSandboxContainer(submission, code)


def frame(stream_type: int, payload: bytes) -> bytes:
    return struct.pack(">BxxxI", stream_type, len(payload)) + payload


def meta(**kwargs):
    data = dict(exit_code=0, max_rss=0, status=None, time=0.0, time_wall=0.0)
    data.update(kwargs)
    return IsolateMeta(**data)


def test_init_creates_container_with_limits(submission, docker_client, sandbox):
    kwargs = docker_client.containers.create.call_args.kwargs

    assert kwargs["image"] == "forseti-sb-python312:latest"
    assert kwargs["network_mode"] == "none"
    assert kwargs["mem_limit"] == "640m"
    assert kwargs["memswap_limit"] == "640m"


def test_start_initializes_isolate_and_copies_code(sandbox):
    sandbox.start()

    sandbox.container.start.assert_called_once()
    sandbox.container.exec_run.assert_called_once_with(cmd=["isolate", "--init"])
    put = sandbox.container.put_archive.call_args.kwargs
    assert put["path"] == "/var/local/lib/isolate/0/box"


def test_compile_skipped_without_compile_command(sandbox):
    with patch.object(sandbox, "_exec") as exec_:
        sandbox.compile()

    exec_.assert_not_called()


def test_compile_executes_command(submission, docker_client, tmp_path):
    submission.language = SubmissionLanguage.JAVA_21
    submission.code_filename = "Main.java"
    sandbox = DockerSandboxContainer(submission, tmp_path)

    with patch.object(sandbox, "_exec") as exec_:
        sandbox.compile()

    exec_.assert_called_once_with(cmd=["javac", "Main.java"])


def test_kill_removes_container(sandbox):
    sandbox.kill()

    sandbox.container.remove.assert_called_once_with(force=True)


def test_demux_splits_streams(sandbox):
    raw = frame(1, b"out1") + frame(2, b"err") + frame(1, b"out2")

    assert sandbox._demux(raw) == (b"out1out2", b"err")


def test_demux_ignores_trailing_garbage(sandbox):
    assert sandbox._demux(frame(1, b"ok") + b"xx") == (b"ok", b"")


def test_parse_status_ok(sandbox):
    assert sandbox._parse_status(meta(), None) == RunResult.Status.OK


def test_parse_status_internal_error(sandbox):
    with pytest.raises(RuntimeError):
        sandbox._parse_status(meta(status="XX"), None)


def test_parse_status_tle(sandbox):
    assert sandbox._parse_status(meta(status="TO"), None) == RunResult.Status.TLE


def test_parse_status_runtime_error(sandbox):
    assert sandbox._parse_status(meta(status="RE"), "boom") == RunResult.Status.RE


def test_parse_status_mle_by_memory(sandbox):
    result = sandbox._parse_status(meta(status="SG", max_rss=128 * 1024 + 1), None)

    assert result == RunResult.Status.MLE


@pytest.mark.parametrize("pattern", ["std::bad_alloc", "MemoryError"])
def test_parse_status_mle_by_stderr(sandbox, pattern):
    assert sandbox._parse_status(meta(status="RE"), pattern) == RunResult.Status.MLE


def test_run_success(sandbox):
    raw_meta = "time:0.012\ntime-wall:0.05\nmax-rss:3000\n\nbadline\n"
    with patch.object(sandbox, "_exec", side_effect=["42\n", raw_meta]) as exec_:
        result = sandbox.run("input")

    assert exec_.call_args_list[0].kwargs == {"stdin": "input"}
    assert result.status == RunResult.Status.OK
    assert result.stdout == "42\n"
    assert result.cpu_time_ms == 12
    assert result.clock_time_ms == 50
    assert result.peak_memory_kb == 3000


def test_run_failure_captures_stderr(sandbox):
    raw_meta = "status:RE\nexitcode:1\n"
    with patch.object(
        sandbox, "_exec", side_effect=[Exception("trace"), raw_meta]
    ):
        result = sandbox.run("")

    assert result.status == RunResult.Status.RE
    assert result.stderr == "trace"
    assert result.stdout is None
    assert result.exit_code == 1
