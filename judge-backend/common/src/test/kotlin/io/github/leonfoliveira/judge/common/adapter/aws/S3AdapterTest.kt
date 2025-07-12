package io.github.leonfoliveira.judge.common.adapter.aws

import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.testcontainer.LocalStackTestContainer
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.shouldBe
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [S3Adapter::class, AwsConfig::class])
class S3AdapterTest(
    val sut: S3Adapter,
) : FunSpec() {
    companion object {
        val localstack = LocalStackTestContainer().start()
    }

    init {
        extensions(SpringExtension)

        test("should upload and download a file from S3") {
            val key = "test-file.txt"
            val content = "Hello, S3!".toByteArray()

            sut.upload(localstack.bucketName, key, content)
            val downloadedContent = sut.download(localstack.bucketName, key)

            downloadedContent shouldBe content
        }

        test("should throw NotFoundException when downloading a non-existent file") {
            val key = "non-existent-file.txt"

            shouldThrow<NotFoundException> {
                sut.download(localstack.bucketName, key)
            }.message shouldBe "Could not find attachment"
        }
    }
}
