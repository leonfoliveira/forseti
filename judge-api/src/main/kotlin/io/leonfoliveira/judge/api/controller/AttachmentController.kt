package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.api.util.Private
import io.leonfoliveira.judge.api.util.Quota
import io.leonfoliveira.judge.core.domain.model.UploadAttachment
import io.leonfoliveira.judge.core.service.attachment.AttachmentService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.temporal.ChronoUnit
import org.springframework.beans.factory.annotation.Value

@RestController
@RequestMapping("/v1/attachments")
class AttachmentController(
    private val attachmentService: AttachmentService,
) {
    @PostMapping("/upload")
    @Quota(5, 1, ChronoUnit.MINUTES)
    @Private
    fun createUploadAttachment(): UploadAttachment {
        return attachmentService.create()
    }
}
