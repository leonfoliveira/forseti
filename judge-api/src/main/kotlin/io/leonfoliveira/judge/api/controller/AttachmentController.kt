package io.leonfoliveira.judge.api.controller

import io.leonfoliveira.judge.api.controller.dto.response.AttachmentResponseDTO
import io.leonfoliveira.judge.api.controller.dto.response.toResponseDTO
import io.leonfoliveira.judge.api.util.Private
import io.leonfoliveira.judge.api.util.Quota
import io.leonfoliveira.judge.core.service.attachment.AttachmentService
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.springframework.http.ContentDisposition
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.time.temporal.ChronoUnit
import java.util.UUID

@RestController
@RequestMapping("/v1/attachments")
class AttachmentController(
    private val attachmentService: AttachmentService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping
    @Quota(5, 1, ChronoUnit.MINUTES)
    @Private
    @Transactional
    fun uploadAttachment(
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<AttachmentResponseDTO> {
        logger.info("[POST] /v1/attachments - filename: ${file.originalFilename}, size: ${file.size}")
        val attachment = attachmentService.upload(file)
        return ResponseEntity.ok(attachment.toResponseDTO())
    }

    @GetMapping("/{key}")
    fun downloadAttachment(
        @PathVariable("key") key: UUID,
    ): ResponseEntity<ByteArray> {
        logger.info("[GET] /v1/attachments/{key} - key: $key")
        val download = attachmentService.download(key)
        val headers =
            HttpHeaders().apply {
                contentDisposition =
                    ContentDisposition
                        .attachment()
                        .filename(download.attachment.filename)
                        .build()
                contentType = MediaType.parseMediaType(download.attachment.contentType)
            }
        return ResponseEntity.ok().headers(headers).body(download.bytes)
    }
}
