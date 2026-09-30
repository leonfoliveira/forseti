from pydantic import BaseModel, Field


class SubmissionSchema(BaseModel):
    """A schema representing a submission to be judged."""

    submission_id: str = Field(alias="submissionId")
    """The unique identifier for the submission."""

    language: str = Field(alias="language")
    """The programming language of the submission."""

    code_id: str = Field(alias="codeId")
    """The unique identifier for the code attachment to be run."""

    code_filename: str = Field(alias="codeFilename")
    """The filename of the code attachment to be run."""

    time_limit_ms: int = Field(alias="timeLimitMs")
    """The time limit for the problem in milliseconds."""

    memory_limit_mb: int = Field(alias="memoryLimitMb")
    """The memory limit for the problem in megabytes."""

    test_cases_id: str = Field(alias="testCasesId")
    """The unique identifiers for the test cases attachment associated with the problem."""
