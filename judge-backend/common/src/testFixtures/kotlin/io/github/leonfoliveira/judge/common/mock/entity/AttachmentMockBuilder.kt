package io.github.leonfoliveira.judge.common.mock.entity

import io.github.leonfoliveira.judge.common.domain.entity.Attachment
import java.time.OffsetDateTime
import java.util.UUID

object AttachmentMockBuilder {
    fun build(
        id: UUID = UUID.randomUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        filename: String = "file.txt",
        contentType: String = "text/plain",
    ) = Attachment(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        filename = filename,
        contentType = contentType,
    )
}