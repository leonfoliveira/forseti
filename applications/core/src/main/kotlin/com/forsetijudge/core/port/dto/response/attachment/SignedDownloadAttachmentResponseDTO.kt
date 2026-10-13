package com.forsetijudge.core.port.dto.response.attachment

import com.forsetijudge.core.domain.entity.Attachment
import java.io.Serializable

data class SignedDownloadAttachmentResponseDTO(
    val attachment: AttachmentResponseDTO,
    val downloadUrl: String,
) : Serializable

fun Attachment.toDownloadSignedResponseDTO(downloadUrl: String): SignedDownloadAttachmentResponseDTO =
    SignedDownloadAttachmentResponseDTO(
        attachment = this.toResponseDTO(),
        downloadUrl = downloadUrl,
    )
