import json
from pathlib import Path
import uuid

import pytest

from autojudge.judge import Judge, JudgeResult
from autojudge.sandbox.language_config import SubmissionLanguage
from autojudge.schema.submission_schema import SubmissionSchema
from test.integration.conftest import BUCKET, JUDGED_QUEUE

pytestmark = pytest.mark.usefixtures("patch_aws")

CODE_DIR = Path(__file__).parent / "code"
TEST_CASES = "1,2\n2,4\n"

TABLE = {
    SubmissionLanguage.CPP_17: {
        JudgeResult.Answer.ACCEPTED: CODE_DIR / "cpp17" / "accepted.cpp",
        JudgeResult.Answer.COMPILATION_ERROR: CODE_DIR / "cpp17" / "compilation_error.cpp",
        JudgeResult.Answer.MEMORY_LIMIT_EXCEEDED: CODE_DIR / "cpp17" / "memory_limit_exceeded.cpp",
        JudgeResult.Answer.RUNTIME_ERROR: CODE_DIR / "cpp17" / "runtime_error.cpp",
        JudgeResult.Answer.TIME_LIMIT_EXCEEDED: CODE_DIR / "cpp17" / "time_limit_exceeded.cpp",
        JudgeResult.Answer.WRONG_ANSWER: CODE_DIR / "cpp17" / "wrong_answer.cpp",
    },
    SubmissionLanguage.JAVA_21: {
        JudgeResult.Answer.ACCEPTED: CODE_DIR / "java21" / "Accepted.java",
        JudgeResult.Answer.COMPILATION_ERROR: CODE_DIR / "java21" / "CompilationError.java",
        JudgeResult.Answer.MEMORY_LIMIT_EXCEEDED: CODE_DIR / "java21" / "MemoryLimitExceeded.java",
        JudgeResult.Answer.RUNTIME_ERROR: CODE_DIR / "java21" / "RuntimeError.java",
        JudgeResult.Answer.TIME_LIMIT_EXCEEDED: CODE_DIR / "java21" / "TimeLimitExceeded.java",
        JudgeResult.Answer.WRONG_ANSWER: CODE_DIR / "java21" / "WrongAnswer.java",
    },
    SubmissionLanguage.NODE_22: {
        JudgeResult.Answer.ACCEPTED: CODE_DIR / "node22" / "accepted.js",
        JudgeResult.Answer.COMPILATION_ERROR: CODE_DIR / "node22" / "compilation_error.js",
        JudgeResult.Answer.MEMORY_LIMIT_EXCEEDED: CODE_DIR / "node22" / "memory_limit_exceeded.js",
        JudgeResult.Answer.RUNTIME_ERROR: CODE_DIR / "node22" / "runtime_error.js",
        JudgeResult.Answer.TIME_LIMIT_EXCEEDED: CODE_DIR / "node22" / "time_limit_exceeded.js",
        JudgeResult.Answer.WRONG_ANSWER: CODE_DIR / "node22" / "wrong_answer.js",
    },
    SubmissionLanguage.PYTHON_312: {
        JudgeResult.Answer.ACCEPTED: CODE_DIR / "python312" / "accepted.py",
        JudgeResult.Answer.COMPILATION_ERROR: CODE_DIR / "python312" / "compilation_error.py",
        JudgeResult.Answer.MEMORY_LIMIT_EXCEEDED: CODE_DIR / "python312" / "memory_limit_exceeded.py",
        JudgeResult.Answer.RUNTIME_ERROR: CODE_DIR / "python312" / "runtime_error.py",
        JudgeResult.Answer.TIME_LIMIT_EXCEEDED: CODE_DIR / "python312" / "time_limit_exceeded.py",
        JudgeResult.Answer.WRONG_ANSWER: CODE_DIR / "python312" / "wrong_answer.py",
    },
}


def queue_url(sqs, name):
    return sqs.get_queue_url(QueueName=name)["QueueUrl"]


def receive_one(sqs, name):
    response = sqs.receive_message(
        QueueUrl=queue_url(sqs, name), WaitTimeSeconds=5, MaxNumberOfMessages=1
    )
    return json.loads(response["Messages"][0]["Body"])


@pytest.mark.parametrize("language,code_path,expected", 
    [
        # C++ 17
        (SubmissionLanguage.CPP_17, CODE_DIR / "cpp17" / "accepted.cpp", JudgeResult.Answer.ACCEPTED),
        (SubmissionLanguage.CPP_17, CODE_DIR / "cpp17" / "compilation_error.cpp", JudgeResult.Answer.COMPILATION_ERROR),
        (SubmissionLanguage.CPP_17, CODE_DIR / "cpp17" / "memory_limit_exceeded.cpp", JudgeResult.Answer.MEMORY_LIMIT_EXCEEDED),
        (SubmissionLanguage.CPP_17, CODE_DIR / "cpp17" / "runtime_error.cpp", JudgeResult.Answer.RUNTIME_ERROR),
        (SubmissionLanguage.CPP_17, CODE_DIR / "cpp17" / "time_limit_exceeded.cpp", JudgeResult.Answer.TIME_LIMIT_EXCEEDED),
        (SubmissionLanguage.CPP_17, CODE_DIR / "cpp17" / "wrong_answer.cpp", JudgeResult.Answer.WRONG_ANSWER),
        # Python 3.12
        (SubmissionLanguage.PYTHON_312, CODE_DIR / "python312" / "accepted.py", JudgeResult.Answer.ACCEPTED),
        (SubmissionLanguage.PYTHON_312, CODE_DIR / "python312" / "memory_limit_exceeded.py", JudgeResult.Answer.MEMORY_LIMIT_EXCEEDED),
        (SubmissionLanguage.PYTHON_312, CODE_DIR / "python312" / "runtime_error.py", JudgeResult.Answer.RUNTIME_ERROR),
        (SubmissionLanguage.PYTHON_312, CODE_DIR / "python312" / "time_limit_exceeded.py", JudgeResult.Answer.TIME_LIMIT_EXCEEDED),
        (SubmissionLanguage.PYTHON_312, CODE_DIR / "python312" / "wrong_answer.py", JudgeResult.Answer.WRONG_ANSWER),
        # Java 21
        (SubmissionLanguage.JAVA_21, CODE_DIR / "java21" / "Accepted.java", JudgeResult.Answer.ACCEPTED),
        (SubmissionLanguage.JAVA_21, CODE_DIR / "java21" / "CompilationError.java", JudgeResult.Answer.COMPILATION_ERROR),
        (SubmissionLanguage.JAVA_21, CODE_DIR / "java21" / "MemoryLimitExceeded.java", JudgeResult.Answer.MEMORY_LIMIT_EXCEEDED),
        (SubmissionLanguage.JAVA_21, CODE_DIR / "java21" / "RuntimeError.java", JudgeResult.Answer.RUNTIME_ERROR),
        (SubmissionLanguage.JAVA_21, CODE_DIR / "java21" / "TimeLimitExceeded.java", JudgeResult.Answer.TIME_LIMIT_EXCEEDED),
        (SubmissionLanguage.JAVA_21, CODE_DIR / "java21" / "WrongAnswer.java", JudgeResult.Answer.WRONG_ANSWER),
        # Node 22
        (SubmissionLanguage.NODE_22, CODE_DIR / "node22" / "accepted.js", JudgeResult.Answer.ACCEPTED),
        (SubmissionLanguage.NODE_22, CODE_DIR / "node22" / "memory_limit_exceeded.js", JudgeResult.Answer.MEMORY_LIMIT_EXCEEDED),
        (SubmissionLanguage.NODE_22, CODE_DIR / "node22" / "runtime_error.js", JudgeResult.Answer.RUNTIME_ERROR),
        (SubmissionLanguage.NODE_22, CODE_DIR / "node22" / "time_limit_exceeded.js", JudgeResult.Answer.TIME_LIMIT_EXCEEDED),
        (SubmissionLanguage.NODE_22, CODE_DIR / "node22" / "wrong_answer.js", JudgeResult.Answer.WRONG_ANSWER),
    ]
)
def test_judge_publishes_expected_answer(
    s3, sqs, require_sandbox_image, language, code_path, expected
):
    require_sandbox_image(language)

    test_cases_id = str(uuid.uuid4())
    s3.put_object(
        Bucket=BUCKET,
        Key=f"attachments/{test_cases_id}",
        Body=TEST_CASES,
    )

    submission_id = str(uuid.uuid4())
    code_id = str(uuid.uuid4())
    s3.put_object(
        Bucket=BUCKET,
        Key=f"attachments/{code_id}",
        Body=code_path.read_bytes(),
    )

    body = {
        "submissionId": submission_id,
        "language": language,
        "codeId": code_id,
        "codeFilename": code_path.name,
        "timeLimitMs": 1000,
        "memoryLimitMb": 1024,
        "testCasesId": test_cases_id,
    }

    Judge().judge(SubmissionSchema(**body))

    assert receive_one(sqs, JUDGED_QUEUE) == {
        "submissionId": submission_id,
        "answer": expected,
    }
