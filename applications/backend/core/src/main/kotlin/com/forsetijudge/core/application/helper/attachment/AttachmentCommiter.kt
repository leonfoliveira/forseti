package com.forsetijudge.core.application.helper.attachment

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class AttachmentCommiter(
    private val attachmentRepository: AttachmentRepository,
) {
    private val logger = SafeLogger(this::class)

    fun commit(
        attachmentId: UUID,
        contestId: UUID,
        context: Attachment.Context,
    ): Attachment {
        logger.info("Committing attachment with id: $attachmentId in contest with id: $contestId and context: $context")

        val attachment =
            attachmentRepository.findByIdAndContestId(attachmentId, contestId)
                ?: throw NotFoundException("Attachment with id $attachmentId not found in contest with id $contestId")

        if (attachment.isCommited) {
            throw ForbiddenException("Attachment with id $attachmentId is already commited")
        }
        if (attachment.context != context) {
            throw ForbiddenException("Attachment with id $attachmentId has invalid context ${attachment.context}")
        }

        attachment.isCommited = true

        attachmentRepository.save(attachment)
        logger.info("Attachment committed successfully")
        return attachment
    }
}
