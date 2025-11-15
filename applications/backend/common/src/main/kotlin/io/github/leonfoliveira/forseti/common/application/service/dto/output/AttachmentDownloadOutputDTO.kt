package io.github.leonfoliveira.forseti.common.application.service.dto.output

import io.github.leonfoliveira.forseti.common.application.domain.entity.Attachment

class AttachmentDownloadOutputDTO(
    val attachment: Attachment,
    val bytes: ByteArray,
)
