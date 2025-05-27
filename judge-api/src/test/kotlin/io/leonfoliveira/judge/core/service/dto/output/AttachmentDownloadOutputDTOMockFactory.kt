package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Attachment
import io.leonfoliveira.judge.core.domain.entity.AttachmentMockFactory

object AttachmentDownloadOutputDTOMockFactory {
    fun build(
        attachment: Attachment = AttachmentMockFactory.build(),
        bytes: ByteArray = ByteArray(0)
    ) = AttachmentDownloadOutputDTO(
        attachment = attachment,
        bytes = bytes
    )
}