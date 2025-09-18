package io.github.leonfoliveira.judge.common.adapter.minio

import io.github.leonfoliveira.judge.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.judge.common.testcontainer.MinioTestContainer
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.minio.MinioClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [MinioAttachmentBucket::class, MinioConfig::class])
@Import(MinioTestContainer::class)
class MinioAttachmentBucketTest(
    val sut: MinioAttachmentBucket,
) : FunSpec({
        test("upload and download attachment") {
            val attachment = AttachmentMockBuilder.build()
            val bytes = "Hello, World!".toByteArray()

            sut.upload(attachment, bytes)
            val downloadedBytes = sut.download(attachment)

            downloadedBytes shouldBe bytes
        }
    })
