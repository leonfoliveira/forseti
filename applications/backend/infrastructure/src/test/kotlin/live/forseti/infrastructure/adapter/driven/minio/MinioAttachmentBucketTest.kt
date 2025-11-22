package live.forseti.infrastructure.adapter.driven.minio

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import live.forseti.core.domain.entity.AttachmentMockBuilder
import live.forseti.core.testcontainer.TestContainers
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest
@Import(TestContainers::class)
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
