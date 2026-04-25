package com.forsetijudge.core.application.service.internal.attachment

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.port.driven.bucket.AttachmentBucket
import org.springframework.stereotype.Service

@Service
class AttachmentDownloader(
    private val attachmentBucket: AttachmentBucket,
) {
    private val logger = SafeLogger(this::class)

    fun download(attachment: Attachment): ByteArray {
        logger.info("Downloading attachment with id: ${attachment.id}")

        val bytes = attachmentBucket.download(attachment)

        logger.info("Attachment downloaded successfully, size: ${bytes.size} bytes")
        return bytes
    }
}
