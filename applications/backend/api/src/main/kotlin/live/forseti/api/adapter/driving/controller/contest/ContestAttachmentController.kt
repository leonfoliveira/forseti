package live.forseti.api.adapter.driving.controller.contest

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import live.forseti.api.adapter.dto.response.AttachmentResponseDTO
import live.forseti.api.adapter.dto.response.ErrorResponseDTO
import live.forseti.api.adapter.dto.response.toResponseDTO
import live.forseti.api.adapter.util.Private
import live.forseti.core.domain.entity.Attachment
import live.forseti.core.domain.model.RequestContext
import live.forseti.core.port.driving.usecase.attachment.AuthorizeAttachmentUseCase
import live.forseti.core.port.driving.usecase.attachment.DownloadAttachmentUseCase
import live.forseti.core.port.driving.usecase.attachment.UploadAttachmentUseCase
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
@RequestMapping("/api/v1")
class ContestAttachmentController(
    private val uploadAttachmentUseCase: UploadAttachmentUseCase,
    private val downloadAttachmentUseCase: DownloadAttachmentUseCase,
    private val authorizeAttachmentUseCase: AuthorizeAttachmentUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/contests/{contestId}/attachments")
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
    fun upload(
        @PathVariable contestId: UUID,
        @RequestParam context: Attachment.Context,
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<AttachmentResponseDTO> {
        logger.info(
            "[POST] /v1/contests/$contestId/attachments " +
                "{ context: $context, filename: ${file.originalFilename}, size: ${file.size} }",
        )
        authorizeAttachmentUseCase.authorizeUpload(contestId, context)
        val member = RequestContext.getContext().session!!.member
        val attachment =
            uploadAttachmentUseCase.upload(
                contestId = contestId,
                memberId = member.id,
                filename = file.originalFilename,
                contentType = file.contentType,
                context = context,
                bytes = file.bytes,
            )
        return ResponseEntity.ok(attachment.toResponseDTO())
    }

    @GetMapping("/contests/{contestId}/attachments/{attachmentId}")
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
    fun download(
        @PathVariable contestId: UUID,
        @PathVariable attachmentId: UUID,
    ): ResponseEntity<ByteArray> {
        logger.info("[GET] /v1/contests/$contestId/attachments/$attachmentId")
        authorizeAttachmentUseCase.authorizeDownload(contestId, attachmentId)
        val download = downloadAttachmentUseCase.download(attachmentId)
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
