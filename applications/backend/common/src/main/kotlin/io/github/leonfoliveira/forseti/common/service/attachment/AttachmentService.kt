package io.github.leonfoliveira.forseti.common.service.attachment

import io.github.leonfoliveira.forseti.common.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.port.AttachmentBucket
import io.github.leonfoliveira.forseti.common.repository.AttachmentRepository
import io.github.leonfoliveira.forseti.common.repository.ContestRepository
import io.github.leonfoliveira.forseti.common.repository.MemberRepository
import io.github.leonfoliveira.forseti.common.service.dto.output.AttachmentDownloadOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AttachmentService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val attachmentRepository: AttachmentRepository,
    private val attachmentBucket: AttachmentBucket,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun upload(
        contestId: UUID,
        memberId: UUID?,
        filename: String?,
        contentType: String?,
        context: Attachment.Context,
        bytes: ByteArray,
    ): Attachment {
        val contest =
            contestRepository.findById(contestId).orElseThrow {
                NotFoundException("Could not find contest with id = $contestId")
            }
        val member =
            memberId?.let {
                memberRepository.findById(memberId).orElseThrow {
                    NotFoundException("Could not find member with id = $memberId")
                }
            }
        val id = UUID.randomUUID()
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

        logger.info("Finished uploading attachment")
        return attachment
    }

    fun download(id: UUID): AttachmentDownloadOutputDTO {
        logger.info("Downloading attachment with id: $id")
        val attachment =
            attachmentRepository.findById(id).orElseThrow {
                NotFoundException("Could not find attachment with id = $id")
            }
        val bytes = attachmentBucket.download(attachment)

        logger.info("Finished downloading attachment")
        return AttachmentDownloadOutputDTO(
            attachment = attachment,
            bytes = bytes,
        )
    }
}
