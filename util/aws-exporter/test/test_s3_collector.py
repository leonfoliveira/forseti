import pytest
from prometheus_client import generate_latest

from aws_exporter.s3_collector import S3Collector


class TestS3Collector:
    @pytest.fixture
    def sut(self, s3_client):
        yield S3Collector(s3_client)

    def test_collect(self, sut, s3_client):
        bucket_name = "test-bucket"
        s3_client.create_bucket(Bucket=bucket_name)
        s3_client.put_object(Bucket=bucket_name, Key="test1.txt", Body="Hello World")
        s3_client.put_object(Bucket=bucket_name, Key="test2.txt", Body="Hello Again")

        sut.collect()

        metrics = generate_latest()

        assert f'aws_s3_number_of_objects{{bucket_name="{bucket_name}"}} 2.0' in metrics.decode('utf-8')
        assert f'aws_s3_bucket_size_bytes{{bucket_name="{bucket_name}"}} 22.0' in metrics.decode('utf-8')

    def test_collect_empty_bucket(self, sut, s3_client):
        bucket_name = "empty-bucket"
        s3_client.create_bucket(Bucket=bucket_name)

        sut.collect()

        metrics = generate_latest()

        assert f'aws_s3_number_of_objects{{bucket_name="{bucket_name}"}} 0.0' in metrics.decode('utf-8')
        assert f'aws_s3_bucket_size_bytes{{bucket_name="{bucket_name}"}} 0.0' in metrics.decode('utf-8')

    def test_collect_error(self, sut, s3_client):
        s3_client.list_buckets = lambda: {"Buckets": [{"Name": "invalid-bucket"}]}

        sut.collect()

        metrics = generate_latest()

        assert 'aws_exporter_s3_fail_count 1.0' in metrics.decode('utf-8')