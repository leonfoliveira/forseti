package live.forseti.core.application.service.attachment

import live.forseti.core.domain.entity.Attachment
import live.forseti.core.domain.exception.NotFoundException
import live.forseti.core.port.driven.AttachmentBucket
import live.forseti.core.port.driven.repository.AttachmentRepository
import live.forseti.core.port.driven.repository.ContestRepository
import live.forseti.core.port.driven.repository.MemberRepository
import live.forseti.core.port.driving.usecase.DownloadAttachmentUseCase
import live.forseti.core.port.driving.usecase.UploadAttachmentUseCase
import live.forseti.core.port.dto.output.AttachmentDownloadOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class AttachmentService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val attachmentRepository: AttachmentRepository,
    private val attachmentBucket: AttachmentBucket,
) : UploadAttachmentUseCase,
    DownloadAttachmentUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Uploads an attachment to the storage bucket and saves its metadata in the repository.
     *
     * @param contestId The ID of the contest to which the attachment belongs.
     * @param memberId The ID of the member uploading the attachment. It can be null for service operations.
     * @param filename The original filename of the attachment. If null, the attachment generated ID will be used.
     * @param contentType The MIME type of the attachment. If null, "application/octet-stream" will be used.
     * @param context The context in which the attachment is used. It is used for authorization purposes.
     * @param bytes The byte array representing the content of the attachment.
     * @return The saved Attachment entity.
     * @throws NotFoundException if the contest or member (if provided) does not exist.
     */
    @Transactional
    override fun upload(
        contestId: UUID,
        memberId: UUID?,
        filename: String?,
        contentType: String?,
        context: Attachment.Context,
        bytes: ByteArray,
    ): Attachment {
        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id = $contestId")
        val member =
            memberId?.let {
                memberRepository.findEntityById(memberId)
                    ?: throw NotFoundException("Could not find member with id = $memberId")
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

    /**
     * Downloads an attachment from the storage bucket.
     *
     * @param id The ID of the attachment to be downloaded.
     * @return An AttachmentDownloadOutputDTO containing the attachment metadata and its byte content.
     * @throws NotFoundException if the attachment with the given ID does not exist.
     */
    @Transactional(readOnly = true)
    override fun download(id: UUID): AttachmentDownloadOutputDTO {
        val attachment =
            attachmentRepository.findEntityById(id)
                ?: throw NotFoundException("Could not find attachment with id = $id")
        return AttachmentDownloadOutputDTO(
            attachment = attachment,
            bytes = download(attachment),
        )
    }

    /**
     * Downloads an attachment from the storage bucket.
     *
     * @param attachment The Attachment entity to be downloaded.
     * @return An AttachmentDownloadOutputDTO containing the attachment metadata and its byte content.
     * @throws NotFoundException if the attachment does not exist.
     */
    @Transactional(readOnly = true)
    override fun download(attachment: Attachment): ByteArray {
        logger.info("Downloading attachment with id: ${attachment.id}")
        val attachment =
            attachmentRepository.findEntityById(attachment.id)
                ?: throw NotFoundException("Could not find attachment with id = ${attachment.id}")
        val bytes = attachmentBucket.download(attachment)

        logger.info("Finished downloading attachment")
        return bytes
    }
}
