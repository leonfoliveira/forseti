package io.github.leonfoliveira.judge.common.adapter.aws

import io.github.leonfoliveira.judge.common.ApplicationTest
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.testcontainer.LocalStackTestContainer
import io.github.leonfoliveira.judge.common.testcontainer.PostgresTestContainer
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.shouldBe
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import

@SpringBootTest(classes = [ApplicationTest::class])
@Import(LocalStackTestContainer::class, PostgresTestContainer::class)
class S3AdapterTest(
    val sut: S3Adapter,
) : FunSpec({
        extensions(SpringExtension)

        test("should upload and download a file from S3") {
            val key = "test-file.txt"
            val content = "Hello, S3!".toByteArray()

            sut.upload(LocalStackTestContainer.BUCKET_NAME, key, content)
            val downloadedContent = sut.download(LocalStackTestContainer.BUCKET_NAME, key)

            downloadedContent shouldBe content
        }

        test("should throw NotFoundException when downloading a non-existent file") {
            val key = "non-existent-file.txt"

            shouldThrow<NotFoundException> {
                sut.download(LocalStackTestContainer.BUCKET_NAME, key)
            }.message shouldBe "Could not find attachment"
        }
    })
