package com.forsetijudge.core.port.driving.usecase.external.attachment

import com.fasterxml.jackson.annotation.JsonIgnore
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.port.dto.response.attachment.AttachmentResponseDTO
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Pattern

interface UploadAttachmentUseCase {
    /**
     * Uploads an attachment to a contest.
     *
     * @param command The command containing the details of the attachment to be uploaded.
     * @return The uploaded attachment entity, including its ID and metadata.
     */
    fun execute(command: Command): Pair<AttachmentResponseDTO, ByteArray>

    /**
     * Command class for uploading an attachment.
     *
     * @param filename The original filename of the attachment (nullable).
     * @param contentType The MIME type of the attachment (nullable).
     * @param context The context of the attachment, indicating its purpose or usage.
     * @param bytes The byte array representing the content of the attachment.
     */
    class Command(
        @field:Pattern(regexp = ".+", message = "'filename' must not be blank")
        @field:Max(255, message = "'filename' must not exceed 255 characters")
        val filename: String?,
        val context: Attachment.Context,
        val bytes: ByteArray,
    )
}
