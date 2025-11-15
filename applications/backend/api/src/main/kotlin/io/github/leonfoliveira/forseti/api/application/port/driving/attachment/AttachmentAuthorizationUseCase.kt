package io.github.leonfoliveira.forseti.api.application.port.driving.attachment

import io.github.leonfoliveira.forseti.common.application.domain.entity.Attachment
import java.util.UUID

interface AttachmentAuthorizationUseCase {
    fun authorizeUpload(
        contestId: UUID,
        context: Attachment.Context,
    )

    fun authorizeDownload(
        contestId: UUID,
        attachmentId: UUID,
    )
}
