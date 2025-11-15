package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.application.dto.output.AttachmentDownloadOutputDTO
import java.util.UUID

interface DownloadAttachmentUseCase {
    fun download(id: UUID): AttachmentDownloadOutputDTO

    fun download(attachment: Attachment): ByteArray
}
