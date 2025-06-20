package io.github.leonfoliveira.judge.common.service.dto.output

import io.github.leonfoliveira.judge.common.domain.entity.Attachment

class AttachmentDownloadOutputDTO(
    val attachment: Attachment,
    val bytes: ByteArray,
)
