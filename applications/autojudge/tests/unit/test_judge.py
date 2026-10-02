import json
from unittest.mock import MagicMock, patch

import pytest

from autojudge.judge import Judge, JudgeResult
from autojudge.sandbox.language_config import SubmissionLanguage
from autojudge.sandbox.models import RunResult
from autojudge.schema.submission_schema import SubmissionSchema

Answer = JudgeResult.Answer


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


def run_result(status=RunResult.Status.OK, stdout="1\n"):
    return RunResult(
        exit_code=0,
        status=status,
        cpu_time_ms=1,
        clock_time_ms=1,
        peak_memory_kb=1,
        stdout=stdout,
        stderr=None,
    )


@pytest.mark.parametrize(
    "result,expected",
    [
        (run_result(stdout=" 1 \n"), Answer.ACCEPTED),
        (run_result(stdout="2"), Answer.WRONG_ANSWER),
        (run_result(RunResult.Status.TLE), Answer.TIME_LIMIT_EXCEEDED),
        (run_result(RunResult.Status.MLE), Answer.MEMORY_LIMIT_EXCEEDED),
        (run_result(RunResult.Status.RE), Answer.RUNTIME_ERROR),
    ],
)
def test_evaluate(result, expected):
    assert Judge()._evaluate(result, "1") == expected


def test_read_test_cases_skips_short_rows(tmp_path):
    path = tmp_path / "cases.csv"
    path.write_text('1 2,3\n"a\nb",c\nonlycolumn\n\n')

    assert Judge()._read_test_cases(path) == [("1 2", "3"), ("a\nb", "c")]


@pytest.fixture
def container():
    with patch("autojudge.judge.DockerSandboxContainer") as cls:
        yield cls.return_value


def test_run_accepted(submission, container):
    container.run.return_value = run_result()

    answer = Judge()._run(submission, "code", [("a", "1"), ("b", "1")])

    assert answer == Answer.ACCEPTED
    assert container.run.call_count == 2
    container.kill.assert_called_once()


def test_run_stops_on_first_failure(submission, container):
    container.run.return_value = run_result(stdout="0")

    answer = Judge()._run(submission, "code", [("a", "1"), ("b", "1")])

    assert answer == Answer.WRONG_ANSWER
    assert container.run.call_count == 1
    container.kill.assert_called_once()


def test_run_compilation_error(submission, container):
    container.compile.side_effect = Exception("bad")

    answer = Judge()._run(submission, "code", [("a", "1")])

    assert answer == Answer.COMPILATION_ERROR
    container.run.assert_not_called()
    container.kill.assert_called_once()


def test_judge_downloads_runs_and_publishes(submission):
    judge = Judge()

    def download(Bucket, Key, Filename):
        with open(Filename, "w") as f:
            f.write("in,out\n" if Key.endswith("tc-1") else "code")

    with patch("autojudge.judge.s3_client") as s3, patch(
        "autojudge.judge.sqs_client"
    ) as sqs, patch.object(judge, "_run", return_value=Answer.ACCEPTED) as run:
        s3.download_file.side_effect = download
        judge.judge(submission)

    assert [c.kwargs["Key"] for c in s3.download_file.call_args_list] == [
        "attachments/code-1",
        "attachments/tc-1",
    ]
    assert run.call_args.args[2] == [("in", "out")]
    sent = sqs.send_message.call_args.kwargs
    assert sent["QueueUrl"] == "test-submission-judged-queue"
    assert json.loads(sent["MessageBody"]) == {
        "submissionId": "sub-1",
        "answer": Answer.ACCEPTED,
    }
