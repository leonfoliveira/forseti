package live.forseti.core.port.driving.usecase.attachment

import live.forseti.core.domain.entity.Attachment
import java.util.UUID

interface AuthorizeAttachmentUseCase {
    /**
     * Authorizes the upload of an attachment in a contest with a given context.
     *
     * @param contestId The ID of the contest.
     * @param context The context of the attachment to be uploaded.
     * @throws ForbiddenException if the upload is not authorized.
     */
    fun authorizeUpload(
        contestId: UUID,
        context: Attachment.Context,
    )

    /**
     * Authorizes the download of an attachment in a contest.
     *
     * @param contestId The ID of the contest.
     * @param attachmentId The ID of the attachment to download.
     * @throws ForbiddenException if the download is not authorized.
     */
    fun authorizeDownload(
        contestId: UUID,
        attachmentId: UUID,
    )
}
