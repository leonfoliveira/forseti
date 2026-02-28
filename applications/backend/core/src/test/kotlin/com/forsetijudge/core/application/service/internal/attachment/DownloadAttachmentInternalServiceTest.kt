package com.forsetijudge.core.application.service.internal.attachment

import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.bucket.AttachmentBucket
import com.forsetijudge.core.port.driving.usecase.internal.attachment.DownloadAttachmentInternalUseCase
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class DownloadAttachmentInternalServiceTest :
    FunSpec({
        val attachmentBucket = mockk<AttachmentBucket>(relaxed = true)

        val sut = DownloadAttachmentInternalService(attachmentBucket)

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build()
        }

        test("should download attachment successfully") {
            val attachment = AttachmentMockBuilder.build()
            val command = DownloadAttachmentInternalUseCase.Command(attachment)
            every { attachmentBucket.download(attachment) } returns ByteArray(0)

            val bytes = sut.execute(command)

            bytes shouldBe ByteArray(0)
            verify { attachmentBucket.download(attachment) }
        }
    })
