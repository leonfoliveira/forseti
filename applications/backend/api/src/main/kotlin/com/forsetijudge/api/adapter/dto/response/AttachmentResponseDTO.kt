package com.forsetijudge.api.adapter.dto.response

import com.forsetijudge.core.domain.entity.Attachment
import java.io.Serializable
import java.util.UUID

data class AttachmentResponseDTO(
    val id: UUID,
    val filename: String,
    val contentType: String,
    val version: Long,
) : Serializable

fun Attachment.toResponseDTO(): AttachmentResponseDTO =
    AttachmentResponseDTO(
        id = this.id,
        filename = this.filename,
        contentType = this.contentType,
        version = this.version,
    )
