package io.github.leonfoliveira.judge.core.service.dto.output

import io.github.leonfoliveira.judge.core.domain.entity.Attachment

class AttachmentDownloadOutputDTO(
    val attachment: Attachment,
    val bytes: ByteArray,
)
