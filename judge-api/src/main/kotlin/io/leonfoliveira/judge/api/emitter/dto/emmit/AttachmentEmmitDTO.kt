package io.leonfoliveira.judge.api.emitter.dto.emmit

import io.leonfoliveira.judge.core.domain.entity.Attachment
import java.util.UUID

data class AttachmentEmmitDTO(
    val key: UUID,
    val filename: String,
    val contentType: String,
)

fun Attachment.toEmmitDTO(): AttachmentEmmitDTO {
    return AttachmentEmmitDTO(
        key = this.key,
        filename = this.filename,
        contentType = this.contentType,
    )
}
