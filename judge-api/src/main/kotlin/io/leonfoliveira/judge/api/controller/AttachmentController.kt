package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.api.controller.dto.response.AttachmentResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.toResponseDTO
import io.leonfoliveira.judge.api.util.Private
import io.leonfoliveira.judge.api.util.Quota
import io.leonfoliveira.judge.core.service.attachment.AttachmentService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.temporal.ChronoUnit
import java.util.UUID
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/v1/attachments")
class AttachmentController(
    private val attachmentService: AttachmentService,
) {
    @PostMapping("/upload")
    @Quota(5, 1, ChronoUnit.MINUTES)
    @Private
    fun uploadAttachment(@RequestParam("file") file: MultipartFile): ResponseEntity<AttachmentResponseDTO> {
        val attachment = attachmentService.upload(file)
        return ResponseEntity.ok(attachment.toResponseDTO())
    }

    @GetMapping("/download")
    @Private
    fun downloadAttachment(@RequestParam("key", required = true) key: UUID): ResponseEntity<ByteArray> {
        val bytes = attachmentService.download(key)
        return ResponseEntity.ok().body(bytes)
    }
}
