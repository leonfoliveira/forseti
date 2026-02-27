package com.forsetijudge.core.domain.entity

import com.forsetijudge.core.application.util.IdGenerator
import java.time.OffsetDateTime
import java.util.UUID

object AttachmentMockBuilder {
    fun build(
        id: UUID = IdGenerator.getUUID(),
        createdAt: OffsetDateTime = OffsetDateTime.now(),
        updatedAt: OffsetDateTime = OffsetDateTime.now(),
        deletedAt: OffsetDateTime? = null,
        contest: Contest = ContestMockBuilder.build(),
        member: Member = MemberMockBuilder.build(),
        filename: String = "file.txt",
        contentType: String = "text/plain",
        context: Attachment.Context = Attachment.Context.SUBMISSION_CODE,
        isCommited: Boolean = true,
    ) = Attachment(
        id = id,
        createdAt = createdAt,
        updatedAt = updatedAt,
        deletedAt = deletedAt,
        contest = contest,
        member = member,
        filename = filename,
        contentType = contentType,
        context = context,
        isCommited = isCommited,
    )
}
