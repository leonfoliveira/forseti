package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Attachment
import java.util.UUID

data class AttachmentResponseDTO(
    val key: UUID,
    val filename: String,
    val contentType: String,
)

fun Attachment.toResponseDTO(): AttachmentResponseDTO {
    return AttachmentResponseDTO(
        key = this.key,
        filename = this.filename,
        contentType = this.contentType,
    )
}
