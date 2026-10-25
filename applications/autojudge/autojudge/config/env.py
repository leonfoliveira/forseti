from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


class AWSCredentials(Settings):
    access_key: Optional[str] = Field(validation_alias="AWS_ACCESS_KEY_ID", default=None)
    secret_key: Optional[str] = Field(validation_alias="AWS_SECRET_ACCESS_KEY", default=None)


class S3Config(Settings):
    bucket: str = Field(validation_alias="AWS_S3_BUCKET")


class SQSConfig(Settings):
    submission_queue: str = Field(validation_alias="AWS_SQS_SUBMISSION_QUEUE")
    submission_judged_queue: str = Field(
        validation_alias="AWS_SQS_SUBMISSION_JUDGED_QUEUE"
    )


class AWSConfig(Settings):
    region: str = Field(validation_alias="AWS_REGION")
    endpoint_url: str | None = Field(validation_alias="AWS_ENDPOINT_URL", default=None)
    credentials: AWSCredentials = Field(default_factory=AWSCredentials)
    s3: S3Config = Field(default_factory=S3Config)
    sqs: SQSConfig = Field(default_factory=SQSConfig)


class ServerConfig(Settings):
    port: int = Field(validation_alias="PORT")


class Env(Settings):
    version: str = Field(validation_alias="VERSION")
    environment: str = Field(validation_alias="ENV")
    debug: bool = Field(validation_alias="DEBUG", default=False)
    aws: AWSConfig = Field(default_factory=AWSConfig)
    server: ServerConfig = Field(default_factory=ServerConfig)
    otel_service_name: str = Field(validation_alias="OTEL_SERVICE_NAME", default="forseti-autojudge")
    otel_exporter_otlp_protocol: str = Field(validation_alias="OTEL_EXPORTER_OTLP_PROTOCOL", default="http/protobuf")
    otel_exporter_otlp_endpoint: Optional[str] = Field(validation_alias="OTEL_EXPORTER_OTLP_ENDPOINT", default=None)
    otel_sdk_disabled: bool = Field(validation_alias="OTEL_SDK_DISABLED", default=True)


env = Env()
