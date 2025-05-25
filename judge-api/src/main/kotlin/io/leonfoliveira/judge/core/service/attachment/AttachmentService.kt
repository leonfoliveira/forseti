package io.leonfoliveira.judge.core.service.attachment

import io.leonfoliveira.judge.core.domain.entity.Attachment
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.repository.AttachmentRepository
import java.util.UUID
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

@Service
class AttachmentService(
    private val attachmentRepository: AttachmentRepository,
    private val bucketAdapter: BucketAdapter,
) {
    fun upload(file: MultipartFile): Attachment {
        val attachment = Attachment(
            filename = file.originalFilename ?: "unknown",
            contentType = file.contentType ?: "application/octet-stream"
        )
        bucketAdapter.upload(file.bytes, attachment.key)
        return attachmentRepository.save(attachment)
    }

    fun download(key: UUID): ByteArray {
        attachmentRepository.findById(key).orElseThrow {
            NotFoundException("Could not find attachment with key = $key")
        }
        return bucketAdapter.download(key)
    }
}
