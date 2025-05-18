package io.leonfoliveira.judge.core.service.attachment

import io.leonfoliveira.judge.core.domain.model.UploadAttachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import org.springframework.stereotype.Service

@Service
class CreateUploadAttachmentService(
    private val bucketAdapter: BucketAdapter,
) {
    fun create(): UploadAttachment {
        return bucketAdapter.createUploadAttachment()
    }
}
