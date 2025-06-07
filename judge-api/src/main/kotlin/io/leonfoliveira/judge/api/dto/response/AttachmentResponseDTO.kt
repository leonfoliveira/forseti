package io.leonfoliveira.judge.api.dto.response

import io.leonfoliveira.judge.core.domain.entity.Attachment
import java.util.UUID

data class AttachmentResponseDTO(
    val id: UUID,
    val filename: String,
    val contentType: String,
)

fun Attachment.toResponseDTO(): AttachmentResponseDTO {
    return AttachmentResponseDTO(
        id = this.id,
        filename = this.filename,
        contentType = this.contentType,
    )
}
