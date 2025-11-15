package io.github.leonfoliveira.forseti.api.adapter.driving.controller.contest

import io.github.leonfoliveira.forseti.api.adapter.dto.response.AttachmentResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.ErrorResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.toResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.util.Private
import io.github.leonfoliveira.forseti.api.application.service.attachment.AttachmentAuthorizationService
import io.github.leonfoliveira.forseti.api.application.util.ApiMetrics
import io.github.leonfoliveira.forseti.common.application.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.application.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.application.service.attachment.AttachmentService
import io.micrometer.core.annotation.Timed
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
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
@RequestMapping("/v1/contests/{contestId}/attachments")
class ContestAttachmentController(
    private val attachmentService: AttachmentService,
    private val attachmentAuthorizationService: AttachmentAuthorizationService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @Timed(ApiMetrics.API_ATTACHMENT_UPLOAD_TIME)
    @PostMapping("{context}")
    @Operation(
        summary = "Upload an attachment",
        description = "Uploads a file as an attachment and returns its metadata containing its ID to later reference.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Attachment uploaded successfully",
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid request format",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    @Private
    @Transactional
    fun uploadAttachment(
        @PathVariable contestId: UUID,
        @PathVariable context: Attachment.Context,
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<AttachmentResponseDTO> {
        logger.info("[POST] /v1/contests/$contestId/attachments/$context { filename: ${file.originalFilename}, size: ${file.size} }")
        attachmentAuthorizationService.authorizeUpload(contestId, context)
        val member = RequestContext.getContext().session!!.member
        val attachment =
            attachmentService.upload(
                contestId = contestId,
                memberId = member.id,
                filename = file.originalFilename,
                contentType = file.contentType,
                context = context,
                bytes = file.bytes,
            )
        return ResponseEntity.ok(attachment.toResponseDTO())
    }

    @Timed(ApiMetrics.API_ATTACHMENT_DOWNLOAD_TIME)
    @GetMapping("/{attachmentId}")
    @Operation(
        summary = "Downloads an attachment",
        description = "Downloads an attachment by its ID. The ID is returned when the attachment is uploaded.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Attachment downloaded successfully",
            ),
            ApiResponse(
                responseCode = "404",
                description = "Attachment not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponseDTO::class))],
            ),
        ],
    )
    @Transactional(readOnly = true)
    fun downloadAttachment(
        @PathVariable contestId: UUID,
        @PathVariable attachmentId: UUID,
    ): ResponseEntity<ByteArray> {
        logger.info("[GET] /v1/contests/$contestId/attachments/$attachmentId")
        attachmentAuthorizationService.authorizeDownload(contestId, attachmentId)
        val download = attachmentService.download(attachmentId)
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
