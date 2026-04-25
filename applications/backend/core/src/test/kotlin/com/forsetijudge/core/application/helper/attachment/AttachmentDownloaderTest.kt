package com.forsetijudge.core.application.helper.attachment

import com.forsetijudge.core.application.helper.attachment.AttachmentDownloader
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.bucket.AttachmentBucket
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class AttachmentDownloaderTest :
    FunSpec({
        val attachmentBucket = mockk<AttachmentBucket>(relaxed = true)

        val sut = AttachmentDownloader(attachmentBucket)

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build()
        }

        test("should download attachment successfully") {
            val attachment = AttachmentMockBuilder.build()
            every { attachmentBucket.download(attachment) } returns ByteArray(0)

            val bytes = sut.download(attachment)

            bytes shouldBe ByteArray(0)
            verify { attachmentBucket.download(attachment) }
        }
    })
