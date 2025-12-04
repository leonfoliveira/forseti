package com.forsetijudge.core.port.dto.output

import com.forsetijudge.core.domain.entity.Attachment

class AttachmentDownloadOutputDTO(
    val attachment: Attachment,
    val bytes: ByteArray,
)
