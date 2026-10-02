import pytest

from autojudge.sandbox.docker_sandbox_container import DockerSandboxContainer
from autojudge.sandbox.language_config import SubmissionLanguage
from autojudge.sandbox.models import RunResult
from autojudge.schema.submission_schema import SubmissionSchema

pytestmark = pytest.mark.usefixtures("python_sandbox_image")


def run_python(tmp_path, code, stdin="", time_limit_ms=2000):
    code_file = tmp_path / "code"
    code_file.write_text(code)
    submission = SubmissionSchema(
        submissionId="sub-1",
        language=SubmissionLanguage.PYTHON_312,
        codeId="code",
        codeFilename="main.py",
        timeLimitMs=time_limit_ms,
        memoryLimitMb=128,
        testCasesId="tc",
    )
    sandbox = DockerSandboxContainer(submission, code_file)
    try:
        sandbox.start()
        sandbox.compile()
        return sandbox.run(stdin)
    finally:
        sandbox.kill()


def test_runs_code_with_stdin(tmp_path):
    result = run_python(tmp_path, "print(int(input()) * 2)", stdin="21\n")

    assert result.status == RunResult.Status.OK
    assert result.stdout.strip() == "42"


def test_runtime_error(tmp_path):
    result = run_python(tmp_path, "raise Exception('boom')")

    assert result.status == RunResult.Status.RE


def test_time_limit_exceeded(tmp_path):
    result = run_python(tmp_path, "while True: pass", time_limit_ms=500)

    assert result.status == RunResult.Status.TLE
