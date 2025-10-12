package io.github.leonfoliveira.forseti.api.dto.response

import io.github.leonfoliveira.forseti.common.domain.entity.Attachment
import java.util.UUID

data class AttachmentResponseDTO(
    val id: UUID,
    val filename: String,
    val contentType: String,
)

fun Attachment.toResponseDTO(): AttachmentResponseDTO =
    AttachmentResponseDTO(
        id = this.id,
        filename = this.filename,
        contentType = this.contentType,
    )
