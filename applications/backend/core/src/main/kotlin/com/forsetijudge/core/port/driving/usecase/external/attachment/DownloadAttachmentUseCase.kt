package com.forsetijudge.core.port.driving.usecase.external.attachment

import com.forsetijudge.core.domain.entity.Attachment
import java.util.UUID

interface DownloadAttachmentUseCase {
    /**
     * Downloads an attachment by its ID and returns the download metadata.
     *
     * @param command The command containing the ID of the attachment to be downloaded.
     * @return A pair containing the attachment metadata and the byte array of the attachment content.
     */
    fun execute(command: Command): Pair<Attachment, ByteArray>

    /**
     * Command class for downloading an attachment.
     *
     * @param attachmentId The ID of the attachment to be downloaded.
     */
    data class Command(
        val attachmentId: UUID,
    )
}
