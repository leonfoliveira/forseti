package io.github.leonfoliveira.forseti.common.service.dto.output

import io.github.leonfoliveira.forseti.common.domain.entity.Attachment

class AttachmentDownloadOutputDTO(
    val attachment: Attachment,
    val bytes: ByteArray,
)
