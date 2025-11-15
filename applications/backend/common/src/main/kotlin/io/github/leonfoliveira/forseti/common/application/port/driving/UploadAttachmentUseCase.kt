package io.github.leonfoliveira.forseti.common.application.port.driving

import io.github.leonfoliveira.forseti.common.application.domain.entity.Attachment
import java.util.UUID

interface UploadAttachmentUseCase {
    /**
     * Uploads an attachment to a contest.
     *
     * @param contestId The ID of the contest to upload the attachment to.
     * @param memberId The ID of the member uploading the attachment, or null for public uploads.
     * @param filename The original filename of the attachment.
     * @param contentType The MIME type of the attachment content.
     * @param context The context in which the attachment is being uploaded.
     * @param bytes The binary content of the attachment.
     * @return The created attachment entity.
     */
    fun upload(
        contestId: UUID,
        memberId: UUID?,
        filename: String?,
        contentType: String?,
        context: Attachment.Context,
        bytes: ByteArray,
    ): Attachment
}
