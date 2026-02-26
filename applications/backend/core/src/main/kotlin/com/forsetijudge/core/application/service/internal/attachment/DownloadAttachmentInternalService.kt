package com.forsetijudge.core.application.service.internal.attachment

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.port.driven.AttachmentBucket
import com.forsetijudge.core.port.driving.usecase.internal.attachment.DownloadAttachmentInternalUseCase
import org.springframework.stereotype.Service

@Service
class DownloadAttachmentInternalService(
    private val attachmentBucket: AttachmentBucket,
) : DownloadAttachmentInternalUseCase {
    private val logger = SafeLogger(this::class)

    override fun execute(command: DownloadAttachmentInternalUseCase.Command): ByteArray {
        logger.info("Downloading attachment with id: ${command.attachment.id}")

        val bytes = attachmentBucket.download(command.attachment)

        logger.info("Attachment downloaded successfully, size: ${bytes.size} bytes")
        return bytes
    }
}
