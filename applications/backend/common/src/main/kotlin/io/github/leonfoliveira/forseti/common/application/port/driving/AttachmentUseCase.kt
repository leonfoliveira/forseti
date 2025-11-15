package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Attachment
import io.github.leonfoliveira.forseti.common.application.dto.output.AttachmentDownloadOutputDTO
import java.util.UUID

interface AttachmentUseCase {
    fun upload(
        contestId: UUID,
        memberId: UUID?,
        filename: String?,
        contentType: String?,
        context: Attachment.Context,
        bytes: ByteArray,
    ): Attachment

    fun download(id: UUID): AttachmentDownloadOutputDTO
}
