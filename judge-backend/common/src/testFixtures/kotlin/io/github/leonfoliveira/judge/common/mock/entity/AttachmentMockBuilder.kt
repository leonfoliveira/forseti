package io.github.leonfoliveira.judge.common.mock.entity

import io.github.leonfoliveira.judge.common.domain.entity.Attachment
import io.github.leonfoliveira.judge.common.domain.entity.Contest
import java.time.OffsetDateTime
import java.util.UUID

object AttachmentMockBuilder {
    fun build(
        id: UUID = UUID.randomUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        contest: Contest = ContestMockBuilder.build(),
        filename: String = "file.txt",
        contentType: String = "text/plain",
        context: Attachment.Context = Attachment.Context.SUBMISSION_CODE,
    ) = Attachment(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        contest = contest,
        filename = filename,
        contentType = contentType,
        context = context,
    )
}
