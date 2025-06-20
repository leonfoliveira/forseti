package io.github.leonfoliveira.judge.common.service.attachment

import io.github.leonfoliveira.judge.common.domain.entity.Attachment
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.port.BucketAdapter
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
import io.github.leonfoliveira.judge.common.service.dto.output.AttachmentDownloadOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@Service
class AttachmentService(
    private val attachmentRepository: AttachmentRepository,
    private val bucketAdapter: BucketAdapter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun upload(file: MultipartFile): Attachment {
        val id = UUID.randomUUID()
        val attachment =
            Attachment(
                id = id,
                filename = file.originalFilename ?: id.toString(),
                contentType = file.contentType ?: "application/octet-stream",
            )
        logger.info("Uploading ${file.bytes} bytes to attachment with id: ${attachment.id}")
        attachmentRepository.save(attachment)
        bucketAdapter.upload(attachment, file.bytes)

        logger.info("Finished uploading attachment")
        return attachment
    }

    fun download(id: UUID): AttachmentDownloadOutputDTO {
        logger.info("Downloading attachment with id: $id")
        val attachment =
            attachmentRepository.findById(id).orElseThrow {
                NotFoundException("Could not find attachment with id = $id")
            }
        val bytes = bucketAdapter.download(attachment)

        logger.info("Finished downloading attachment")
        return AttachmentDownloadOutputDTO(
            attachment = attachment,
            bytes = bytes,
        )
    }
}
