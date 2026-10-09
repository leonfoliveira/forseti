from __future__ import annotations

import csv
import json
import logging
import os
import io
import tempfile
from typing import List, Optional
from uuid_v7.base import uuid7

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

    class Final(BaseModel):
        answer: str
        total_test_cases: int
        approved_test_cases: int
        max_cpu_time_ms: Optional[int]
        max_clock_time_ms: Optional[int]
        max_peak_memory_kb: Optional[int]
        details_id: Optional[str]


    class Detail(BaseModel):
        exit_code: int
        status: str
        cpu_time_ms: int
        clock_time_ms: int
        peak_memory_kb: int
        stdin: str
        stdout: Optional[str]
        stderr: Optional[str]
        expected_stdout: str
        answer: str


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

            result = self._run(submission, code_file_path, test_cases)

        logger.info(f"Submission {submission.submission_id} judged as {result.answer}")

        logger.info("Publishing result")
        sqs_client.send_message(
            QueueUrl=env.aws.sqs.submission_judged_queue,
            MessageBody=json.dumps(
                {
                    "submissionId": submission.submission_id,
                    "answer": result.answer,
                    "totalTestCases": result.total_test_cases,
                    "approvedTestCases": result.approved_test_cases,
                    "maxCpuTimeMs": result.max_cpu_time_ms,
                    "maxClockTimeMs": result.max_clock_time_ms,
                    "maxPeakMemoryKb": result.max_peak_memory_kb,
                    "detailsId": result.details_id,
                }
            ),
        )

    def _run(
        self,
        submission: SubmissionSchema,
        code_file_path: str,
        test_cases: list[tuple[str, str]],
    ) ->JudgeResult.Final:
        """Run the submission against its test cases in an isolated container."""

        logger.info(f"Running submission {submission.submission_id} in Docker sandbox")

        container = DockerSandboxContainer(submission, code_file_path)
        try:
            container.start()
            try:
                container.compile()
            except Exception as ex:
                logger.info(f"Compilation error: {ex}")
                return JudgeResult.Final(
                    answer=JudgeResult.Answer.COMPILATION_ERROR,
                    total_test_cases=0,
                    approved_test_cases=0,
                    max_cpu_time_ms=None,
                    max_clock_time_ms=None,
                    max_peak_memory_kb=None,
                    details_id=None,
                )

            answer = JudgeResult.Answer.ACCEPTED
            details: list[JudgeResult.Detail] = []
            total_test_cases = len(test_cases)
            approved_test_cases = 0
            max_cpu_time_ms = 0
            max_clock_time_ms = 0
            max_peak_memory_kb = 0

            logger.info(f"Running {len(test_cases)} test cases")
            for idx, (stdin, expected_stdout) in enumerate(test_cases):
                result = container.run(stdin)                
                answer = self._evaluate(result, expected_stdout)

                details.append(JudgeResult.Detail(
                    test_case_idx=idx,
                    exit_code=result.exit_code,
                    status=result.status,
                    cpu_time_ms=result.cpu_time_ms,
                    clock_time_ms=result.clock_time_ms,
                    peak_memory_kb=result.peak_memory_kb,
                    stdin=stdin,
                    stdout=result.stdout,
                    stderr=result.stderr,
                    expected_stdout=expected_stdout,
                    answer=answer,
                ))

                logger.info(
                    f"Test case {idx} produced answer {answer} with result {result}"
                )

                max_cpu_time_ms = max(max_cpu_time_ms, result.cpu_time_ms)
                max_clock_time_ms = max(max_clock_time_ms, result.clock_time_ms)
                max_peak_memory_kb = max(max_peak_memory_kb, result.peak_memory_kb)

                if answer != JudgeResult.Answer.ACCEPTED:
                    logger.info(f"Test case {idx} failed with answer {answer}")
                    break
                else:
                    approved_test_cases += 1

            details_id = self._store_details(details) if details else None

            if answer == JudgeResult.Answer.ACCEPTED:
                logger.info("All test cases passed")
                return JudgeResult.Final(
                    answer=JudgeResult.Answer.ACCEPTED,
                    total_test_cases=total_test_cases,
                    approved_test_cases=approved_test_cases,
                    max_cpu_time_ms=max_cpu_time_ms,
                    max_clock_time_ms=max_clock_time_ms,
                    max_peak_memory_kb=max_peak_memory_kb,
                    details_id=details_id,
                )
            else:
                logger.info(f"{approved_test_cases}/{total_test_cases} test cases passed")
                return JudgeResult.Final(
                    answer=answer,
                    total_test_cases=total_test_cases,
                    approved_test_cases=approved_test_cases,
                    max_cpu_time_ms=max_cpu_time_ms,
                    max_clock_time_ms=max_clock_time_ms,
                    max_peak_memory_kb=max_peak_memory_kb,
                    details_id=details_id,
                )
        finally:
            container.kill()

    def _evaluate(self, result: RunResult, expected_stdout: str) -> JudgeResult.Answer:
        """Evaluate a single run result against the expected output."""

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

    def _store_details(self, details: List[JudgeResult.Detail]) -> str:
        """Process the details of a run result."""

        bytes_output = io.BytesIO()
        text_wrapper = io.TextIOWrapper(bytes_output, encoding="utf-8", newline="")

        writer = csv.writer(text_wrapper)
        for idx, detail in enumerate(details):
            writer.writerow([
                idx,
                detail.stdin,
                detail.stdout,
                detail.stderr,
                detail.expected_stdout,
                detail.answer,
            ])

        text_wrapper.flush()
        bytes_output.seek(0)

        attachment_id = str(uuid7())
        file_key = f"{Judge.S3_ATTACHMENTS_PREFIX}{attachment_id}"

        s3_client.upload_fileobj(
            Fileobj=bytes_output,
            Bucket=env.aws.s3.bucket,
            Key=file_key
        )

        logger.info(f"Stored details with attachment ID: {attachment_id}")
        return attachment_id
