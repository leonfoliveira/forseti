package com.forsetijudge.core.api.http.controller

import com.forsetijudge.core.api.http.dto.request.attachment.SignedUploadAttachmentRequestDTO
import com.forsetijudge.core.port.dto.response.attachment.SignedDownloadAttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.attachment.SignedUploadAttachmentResponseDTO
import com.forsetijudge.core.port.input.usecase.attachment.SignedDownloadAttachmentUseCase
import com.forsetijudge.core.port.input.usecase.attachment.SignedUploadAttachmentUseCase
import com.forsetijudge.core.util.SafeLogger
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/v1")
@Suppress("unused")
class AttachmentController(
    private val signedUploadAttachmentUseCase: SignedUploadAttachmentUseCase,
    private val signedDownloadAttachmentUseCase: SignedDownloadAttachmentUseCase,
) {
    private val logger = SafeLogger(this::class)

    @PostMapping("/contests/{contestId}/attachments")
    fun getUploadSignedUrl(
        @PathVariable contestId: UUID,
        @RequestBody body: SignedUploadAttachmentRequestDTO,
    ): ResponseEntity<SignedUploadAttachmentResponseDTO> {
        logger.info("[POST] /v1/contests/$contestId/attachments")
        val attachment =
            signedUploadAttachmentUseCase.execute(
                SignedUploadAttachmentUseCase.Command(
                    contestId = contestId,
                    filename = body.filename,
                    context = body.context,
                    contentType = body.contentType,
                ),
            )
        return ResponseEntity.ok(attachment)
    }

    @GetMapping("/contests/{contestId}/attachments/{attachmentId}")
    fun getDownloadSignedUrl(
        @PathVariable contestId: UUID,
        @PathVariable attachmentId: UUID,
    ): ResponseEntity<SignedDownloadAttachmentResponseDTO> {
        logger.info("[GET] /v1/contests/$contestId/attachments/$attachmentId")
        val attachment =
            signedDownloadAttachmentUseCase.execute(
                SignedDownloadAttachmentUseCase.Command(
                    contestId = contestId,
                    attachmentId = attachmentId,
                ),
            )
        return ResponseEntity.ok(attachment)
    }
}
