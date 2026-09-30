from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


class AWSCredentials(Settings):
    access_key: str = Field(validation_alias="AWS_ACCESS_KEY_ID")
    secret_key: str = Field(validation_alias="AWS_SECRET_ACCESS_KEY")


class S3Config(Settings):
    bucket: str = Field(validation_alias="AWS_S3_BUCKET")


class SQSConfig(Settings):
    submission_queue: str = Field(validation_alias="AWS_SQS_SUBMISSION_QUEUE")
    submission_judged_queue: str = Field(
        validation_alias="AWS_SQS_SUBMISSION_JUDGED_QUEUE")


class AWSConfig(Settings):
    region: str = Field(validation_alias="AWS_REGION")
    endpoint_url: str | None = Field(default=None, validation_alias="AWS_ENDPOINT_URL")
    credentials: AWSCredentials = Field(default_factory=AWSCredentials)
    s3: S3Config = Field(default_factory=S3Config)
    sqs: SQSConfig = Field(default_factory=SQSConfig)


class ServerConfig(Settings):
    port: int = Field(validation_alias="PORT")


class Env(Settings):
    version: str = Field(validation_alias="VERSION")
    debug: bool = Field(default=False, validation_alias="DEBUG")
    aws: AWSConfig = Field(default_factory=AWSConfig)
    server: ServerConfig = Field(default_factory=ServerConfig)


env = Env()
