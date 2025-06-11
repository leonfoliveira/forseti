package io.leonfoliveira.judge.core.dto.output

import io.leonfoliveira.judge.core.domain.entity.Attachment
import io.leonfoliveira.judge.core.domain.entity.AttachmentMockFactory
import io.leonfoliveira.judge.core.service.dto.output.AttachmentDownloadOutputDTO

object AttachmentDownloadOutputDTOMockFactory {
    fun build(
        attachment: Attachment = AttachmentMockFactory.build(),
        bytes: ByteArray = ByteArray(0),
    ) = AttachmentDownloadOutputDTO(
        attachment = attachment,
        bytes = bytes,
    )
}
