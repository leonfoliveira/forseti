package com.forsetijudge.core.api.http.dto.request.attachment

import com.forsetijudge.core.domain.entity.Attachment

data class SignedUploadAttachmentRequestDTO(
    val filename: String,
    val context: Attachment.Context,
    val contentType: String,
)
