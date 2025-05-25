package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Attachment
import java.util.UUID

data class AttachmentResponseDTO(
    val key: UUID
)

fun Attachment.toResponseDTO(): AttachmentResponseDTO {
    return AttachmentResponseDTO(
        key = this.key
    )
}
