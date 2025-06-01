package io.leonfoliveira.judge.core.service.attachment

import io.leonfoliveira.judge.core.domain.entity.Attachment
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.repository.AttachmentRepository
import io.leonfoliveira.judge.core.service.dto.output.AttachmentDownloadOutputDTO
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@Service
class AttachmentService(
    private val attachmentRepository: AttachmentRepository,
    private val bucketAdapter: BucketAdapter,
) {
    fun upload(file: MultipartFile): Attachment {
        val key = UUID.randomUUID()
        val attachment =
            Attachment(
                key = key,
                filename = file.originalFilename ?: key.toString(),
                contentType = file.contentType ?: "application/octet-stream",
            )
        val bytes = file.bytes
        bucketAdapter.upload(bytes, attachment.key)
        return attachmentRepository.save(attachment)
    }

    fun download(key: UUID): AttachmentDownloadOutputDTO {
        val attachment =
            attachmentRepository.findById(key).orElseThrow {
                NotFoundException("Could not find attachment with key = $key")
            }
        val bytes = bucketAdapter.download(key)
        return AttachmentDownloadOutputDTO(
            attachment = attachment,
            bytes = bytes,
        )
    }
}
