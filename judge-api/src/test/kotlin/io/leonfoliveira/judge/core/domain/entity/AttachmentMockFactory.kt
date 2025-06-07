package io.leonfoliveira.judge.core.domain.entity

import java.util.UUID

object AttachmentMockFactory {
    fun build(
        id: UUID = UUID.randomUUID(),
        filename: String = "attachment.txt",
        contentType: String = "text/plain",
    ) = Attachment(
        id = id,
        filename = filename,
        contentType = contentType,
    )
}
