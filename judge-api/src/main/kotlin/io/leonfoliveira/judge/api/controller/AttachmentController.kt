package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.core.domain.model.UploadAttachment
import io.leonfoliveira.judge.core.service.attachment.CreateUploadAttachmentService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/attachments")
class AttachmentController(
    private val createUploadAttachmentService: CreateUploadAttachmentService,
) {
    @PostMapping("/upload")
    fun createUploadAttachment(): UploadAttachment {
        return createUploadAttachmentService.create()
    }
}
