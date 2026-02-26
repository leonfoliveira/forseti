package com.forsetijudge.core.application.service.internal.attachment

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.event.AttachmentsEvent
import com.forsetijudge.core.port.driven.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driving.usecase.internal.attachment.UploadAttachmentInternalUseCase
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service

@Service
class UploadAttachmentInternalService(
    private val attachmentRepository: AttachmentRepository,
    private val attachmentBucket: AttachmentBucket,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : UploadAttachmentInternalUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun execute(command: UploadAttachmentInternalUseCase.Command): Pair<Attachment, ByteArray> {
        logger.info(
            "Uploading attachment for contest with id: ${command.contest.id}, member with id: ${command.member.id} " +
                "and context: ${command.context}",
        )

        val id = IdGenerator.getUUID()
        val attachment =
            Attachment(
                id = id,
                contest = command.contest,
                member = command.member,
                filename = command.filename ?: id.toString(),
                contentType = command.contentType ?: "application/octet-stream",
                context = command.context,
            )

        logger.info("Uploading ${command.bytes.size} bytes to attachment with id: ${attachment.id}")
        attachmentRepository.save(attachment)
        attachmentBucket.upload(attachment, command.bytes)
        applicationEventPublisher.publishEvent(AttachmentsEvent.Uploaded(attachment))

        return Pair(attachment, command.bytes)
    }
}
