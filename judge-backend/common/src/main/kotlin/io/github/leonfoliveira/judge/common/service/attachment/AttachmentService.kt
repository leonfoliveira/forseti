package io.github.leonfoliveira.judge.common.service.attachment

import io.github.leonfoliveira.judge.common.domain.entity.Attachment
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.port.AttachmentBucketAdapter
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.service.dto.output.AttachmentDownloadOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AttachmentService(
    private val contestRepository: ContestRepository,
    private val attachmentRepository: AttachmentRepository,
    private val attachmentBucketAdapter: AttachmentBucketAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun upload(
        contestId: UUID,
        filename: String?,
        contentType: String?,
        context: Attachment.Context,
        bytes: ByteArray,
    ): Attachment {
        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id = $contestId")
            }
        val id = UUID.randomUUID()
        val attachment =
            Attachment(
                id = id,
                contest = contest,
                filename = filename ?: id.toString(),
                contentType = contentType ?: "application/octet-stream",
                context = context,
            )
        logger.info("Uploading ${bytes.size} bytes to attachment with id: ${attachment.id}")
        attachmentRepository.save(attachment)
        attachmentBucketAdapter.upload(attachment, bytes)

        logger.info("Finished uploading attachment")
        return attachment
    }

    fun download(id: UUID): AttachmentDownloadOutputDTO {
        logger.info("Downloading attachment with id: $id")
        val attachment =
            attachmentRepository.findById(id).orElseThrow {
                NotFoundException("Could not find attachment with id = $id")
            }
        val bytes = attachmentBucketAdapter.download(attachment)

        logger.info("Finished downloading attachment")
        return AttachmentDownloadOutputDTO(
            attachment = attachment,
            bytes = bytes,
        )
    }
}
