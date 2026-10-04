from __future__ import annotations

import csv
import json
import logging
import os
import tempfile

from pydantic import BaseModel

from autojudge.config.aws_config import s3_client, sqs_client
from autojudge.config.env import env
from autojudge.sandbox.docker_sandbox_container import DockerSandboxContainer, RunResult
from autojudge.schema.submission_schema import SubmissionSchema

logger = logging.getLogger(__name__)


class JudgeResult(BaseModel):
    class Answer:
        ACCEPTED = "ACCEPTED"
        WRONG_ANSWER = "WRONG_ANSWER"
        COMPILATION_ERROR = "COMPILATION_ERROR"
        RUNTIME_ERROR = "RUNTIME_ERROR"
        TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED"
        MEMORY_LIMIT_EXCEEDED = "MEMORY_LIMIT_EXCEEDED"


class Judge:
    """Judge handles the process of evaluating code submissions against test cases."""

    S3_ATTACHMENTS_PREFIX = "attachments/"

    def judge(self, submission: SubmissionSchema):
        """Download a submission and its test cases, then publish the result."""

        logger.info(f"Judging submission {submission.submission_id}")

        with tempfile.TemporaryDirectory() as tmp_dir:
            code_file_path = f"{tmp_dir}/{submission.code_id}"
            s3_client.download_file(
                Bucket=env.aws.s3.bucket,
                Key=f"{self.S3_ATTACHMENTS_PREFIX}{submission.code_id}",
                Filename=code_file_path,
            )

            test_case_file_path = f"{tmp_dir}/{submission.test_cases_id}"
            s3_client.download_file(
                Bucket=env.aws.s3.bucket,
                Key=f"{self.S3_ATTACHMENTS_PREFIX}{submission.test_cases_id}",
                Filename=test_case_file_path,
            )
            test_cases = self._read_test_cases(test_case_file_path)

            answer = self._run(submission, code_file_path, test_cases)

        logger.info(f"Submission {submission.submission_id} judged as {answer}")

        logger.info("Publishing result")
        sqs_client.send_message(
            QueueUrl=env.aws.sqs.submission_judged_queue,
            MessageBody=json.dumps(
                {
                    "submissionId": submission.submission_id,
                    "answer": answer,
                }
            ),
        )

    def _run(
        self,
        submission: SubmissionSchema,
        code_file_path: str,
        test_cases: list[tuple[str, str]],
    ) -> JudgeResult.Answer:
        """Run the submission against its test cases in an isolated container."""

        logger.info(f"Running submission {submission.submission_id} in Docker sandbox")

        container = DockerSandboxContainer(submission, code_file_path)
        try:
            container.start()
            try:
                container.compile()
            except Exception as ex:
                logger.info(f"Compilation error: {ex}")
                return JudgeResult.Answer.COMPILATION_ERROR

            logger.info(f"Running {len(test_cases)} test cases")
            for idx, (stdin, expected_stdout) in enumerate(test_cases):
                result = container.run(stdin)
                answer = self._evaluate(result, expected_stdout)
                logger.info(
                    f"Test case {idx} produced answer {answer} with result {result}"
                )

                if answer != JudgeResult.Answer.ACCEPTED:
                    logger.info(f"Test case {idx} failed with answer {answer}")
                    return answer

            logger.info("All test cases passed")
            return JudgeResult.Answer.ACCEPTED
        finally:
            container.kill()

    def _evaluate(self, result: RunResult, expected_stdout: str) -> JudgeResult.Answer:
        if result.status == RunResult.Status.OK:
            if result.stdout.strip() == expected_stdout.strip():
                return JudgeResult.Answer.ACCEPTED
            else:
                return JudgeResult.Answer.WRONG_ANSWER
        elif result.status == RunResult.Status.TLE:
            return JudgeResult.Answer.TIME_LIMIT_EXCEEDED
        elif result.status == RunResult.Status.MLE:
            return JudgeResult.Answer.MEMORY_LIMIT_EXCEEDED
        else:
            return JudgeResult.Answer.RUNTIME_ERROR

    def _read_test_cases(self, file_path: os.PathLike) -> list[tuple[str, str]]:
        """Read CSV test cases as (input, expected output) pairs."""

        with open(file_path, newline="") as f:
            return [(row[0], row[1]) for row in csv.reader(f) if len(row) >= 2]
