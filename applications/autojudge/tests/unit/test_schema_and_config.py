from autojudge.config.env import Env
from autojudge.sandbox.language_config import LANGUAGE_CONFIGS, SubmissionLanguage
from autojudge.schema.submission_schema import SubmissionSchema


def make_body(**overrides):
    body = {
        "submissionId": "sub-1",
        "language": SubmissionLanguage.PYTHON_312,
        "codeId": "code-1",
        "codeFilename": "main.py",
        "timeLimitMs": 1000,
        "memoryLimitMb": 128,
        "testCasesId": "tc-1",
    }
    body.update(overrides)
    return body


def test_submission_schema_parses_aliases():
    submission = SubmissionSchema(**make_body())

    assert submission.submission_id == "sub-1"
    assert submission.code_id == "code-1"
    assert submission.code_filename == "main.py"
    assert submission.time_limit_ms == 1000
    assert submission.memory_limit_mb == 128
    assert submission.test_cases_id == "tc-1"


def test_env_reads_environment_variables(monkeypatch):
    monkeypatch.setenv("DEBUG", "true")
    monkeypatch.setenv("AWS_ENDPOINT_URL", "http://localhost:4566")

    env = Env()

    assert env.debug is True
    assert env.server.port == 8082
    assert env.aws.endpoint_url == "http://localhost:4566"
    assert env.aws.s3.bucket == "test-bucket"
    assert env.aws.sqs.submission_queue == "test-submission-queue"
    assert env.aws.credentials.access_key == "test"


def test_language_configs_cover_all_languages():
    languages = {
        v for k, v in vars(SubmissionLanguage).items() if not k.startswith("_")
    }
    assert set(LANGUAGE_CONFIGS) == languages


def test_cpp_commands():
    config = LANGUAGE_CONFIGS[SubmissionLanguage.CPP_17]

    assert config.create_compile_command("main.cpp")[:4] == [
        "g++",
        "-o",
        "a.out",
        "main.cpp",
    ]
    assert config.create_run_command("main.cpp") == ["/box/a.out"]


def test_java_commands():
    config = LANGUAGE_CONFIGS[SubmissionLanguage.JAVA_21]

    assert config.create_compile_command("Main.java") == ["javac", "Main.java"]
    assert config.create_run_command("Main.java")[-1] == "Main"


def test_interpreted_languages_have_no_compile_step():
    for language, binary in [
        (SubmissionLanguage.PYTHON_312, "/usr/bin/python3"),
        (SubmissionLanguage.NODE_22, "/usr/bin/node"),
    ]:
        config = LANGUAGE_CONFIGS[language]
        assert config.create_compile_command("main") is None
        assert config.create_run_command("main") == [binary, "/box/main"]
