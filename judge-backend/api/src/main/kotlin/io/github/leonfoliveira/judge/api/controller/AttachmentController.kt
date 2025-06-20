package io.github.leonfoliveira.judge.api.controller

import io.github.leonfoliveira.judge.api.dto.response.AttachmentResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.toResponseDTO
import io.github.leonfoliveira.judge.api.util.Private
import io.github.leonfoliveira.judge.common.service.attachment.AttachmentService
import org.slf4j.LoggerFactory
import org.springframework.http.ContentDisposition
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@RestController
@RequestMapping("/v1/attachments")
class AttachmentController(
    private val attachmentService: AttachmentService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping
    @Private
    @Transactional
    fun uploadAttachment(
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<AttachmentResponseDTO> {
        logger.info("[POST] /v1/attachments - filename: ${file.originalFilename}, size: ${file.size}")
        val attachment = attachmentService.upload(file)
        return ResponseEntity.ok(attachment.toResponseDTO())
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    fun downloadAttachment(
        @PathVariable("id") id: UUID,
    ): ResponseEntity<ByteArray> {
        logger.info("[GET] /v1/attachments/{id} - id: $id")
        val download = attachmentService.download(id)
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
