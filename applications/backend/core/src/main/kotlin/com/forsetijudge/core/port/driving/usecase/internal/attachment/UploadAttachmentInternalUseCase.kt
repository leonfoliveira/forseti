package com.forsetijudge.core.port.driving.usecase.internal.attachment

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member

interface UploadAttachmentInternalUseCase {
    /**
     * Uploads an attachment to a contest.
     *
     * @param command The command containing the details of the attachment to be uploaded.
     * @return A pair containing the uploaded Attachment entity and the byte array of the attachment content.
     */
    fun execute(command: Command): Pair<Attachment, ByteArray>

    /**
     * Command class for uploading an attachment.
     *
     * @param filename The original filename of the attachment (nullable).
     * @param contentType The MIME type of the attachment (nullable).
     * @param context The context of the attachment, indicating its purpose or usage.
     * @param bytes The byte array representing the content of the attachment.
     */
    class Command(
        val contest: Contest,
        val member: Member,
        val filename: String?,
        val contentType: String?,
        val context: Attachment.Context,
        val bytes: ByteArray,
    )
}
