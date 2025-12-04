package com.forsetijudge.core.application.service.attachment

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.AttachmentBucket
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driving.usecase.attachment.DownloadAttachmentUseCase
import com.forsetijudge.core.port.dto.output.AttachmentDownloadOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class DownloadAttachmentService(
    private val attachmentRepository: AttachmentRepository,
    private val attachmentBucket: AttachmentBucket,
) : DownloadAttachmentUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

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
