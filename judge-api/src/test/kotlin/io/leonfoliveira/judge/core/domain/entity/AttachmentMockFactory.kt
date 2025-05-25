package io.leonfoliveira.judge.core.domain.entity

import java.time.LocalDateTime
import java.util.UUID

object AttachmentMockFactory {
    fun build(
        key: UUID = UUID.randomUUID(),
        filename: String = "attachment.txt",
        contentType: String = "text/plain",
        createdAt: LocalDateTime = LocalDateTime.now(),
    ) = Attachment(
        key = key,
        filename = filename,
        contentType = contentType,
        createdAt = createdAt,
    )
}
