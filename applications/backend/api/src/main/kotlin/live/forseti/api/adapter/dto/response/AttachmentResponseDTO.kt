package live.forseti.api.adapter.dto.response

import live.forseti.core.domain.entity.Attachment
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
