package com.forsetijudge.core.application.helper.attachment

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.AttachmentEvent
import com.forsetijudge.core.port.driven.bucket.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service

@Service
class AttachmentUploader(
    private val attachmentRepository: AttachmentRepository,
    private val attachmentBucket: AttachmentBucket,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    private val logger = SafeLogger(this::class)

    fun upload(
        contest: Contest,
        member: Member,
        filename: String?,
        contentType: String?,
        context: Attachment.Context,
        bytes: ByteArray,
    ): Pair<Attachment, ByteArray> {
        logger.info(
            "Uploading attachment for contest with id: ${contest.id}, member with id: ${member.id} " +
                "and context: $context",
        )

        val id = IdGenerator.getUUID()
        val attachment =
            Attachment(
                id = id,
                contest = contest,
                member = member,
                filename = filename ?: id.toString(),
                contentType = contentType ?: "application/octet-stream",
                context = context,
            )

        logger.info("Uploading ${bytes.size} bytes to attachment with id: ${attachment.id}")
        attachmentRepository.save(attachment)
        attachmentBucket.upload(attachment, bytes)
        applicationEventPublisher.publishEvent(AttachmentEvent.Uploaded(attachment.id))

        return attachment to bytes
    }
}
