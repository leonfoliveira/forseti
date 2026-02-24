package com.forsetijudge.api.adapter.driving.controller.contests

import com.forsetijudge.api.adapter.util.Private
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.port.driving.usecase.external.attachment.DownloadAttachmentUseCase
import com.forsetijudge.core.port.driving.usecase.external.attachment.UploadAttachmentUseCase
import com.forsetijudge.core.port.dto.response.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.toResponseBodyDTO
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
import java.util.UUID

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class ContestAttachmentController(
    private val uploadAttachmentUseCase: UploadAttachmentUseCase,
    private val downloadAttachmentUseCase: DownloadAttachmentUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/contests/{contestId}/attachments")
    @Private(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF, Member.Type.JUDGE, Member.Type.CONTESTANT)
    fun upload(
        @PathVariable contestId: UUID,
        @RequestParam context: Attachment.Context,
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<AttachmentResponseDTO> {
        logger.info("[POST] /v1/contests/$contestId/attachments")
        val (attachment) =
            uploadAttachmentUseCase.execute(
                UploadAttachmentUseCase.Command(
                    filename = file.originalFilename,
                    contentType = file.contentType,
                    context = context,
                    bytes = file.bytes,
                ),
            )
        return ResponseEntity.ok(attachment.toResponseBodyDTO())
    }

    @GetMapping("/contests/{contestId}/attachments/{attachmentId}")
    fun download(
        @PathVariable contestId: UUID,
        @PathVariable attachmentId: UUID,
    ): ResponseEntity<ByteArray> {
        logger.info("[GET] /v1/contests/$contestId/attachments/$attachmentId")
        val (attachment, bytes) =
            downloadAttachmentUseCase.execute(
                DownloadAttachmentUseCase.Command(
                    attachmentId = attachmentId,
                ),
            )
        val headers =
            HttpHeaders().apply {
                contentDisposition =
                    ContentDisposition
                        .attachment()
                        .filename(attachment.filename)
                        .build()
                contentType = MediaType.parseMediaType(attachment.contentType)
            }
        return ResponseEntity.ok().headers(headers).body(bytes)
    }
}
