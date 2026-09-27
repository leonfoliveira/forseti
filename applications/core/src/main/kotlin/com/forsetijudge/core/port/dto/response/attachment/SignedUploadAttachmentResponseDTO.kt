package com.forsetijudge.core.port.dto.response.attachment

import com.forsetijudge.core.domain.entity.Attachment
import java.io.Serializable

data class SignedUploadAttachmentResponseDTO(
    val attachment: AttachmentResponseDTO,
    val uploadUrl: String,
) : Serializable

fun Attachment.toUploadSignedResponseBodyDTO(uploadUrl: String): SignedUploadAttachmentResponseDTO =
    SignedUploadAttachmentResponseDTO(
        attachment = this.toResponseBodyDTO(),
        uploadUrl = uploadUrl,
    )
