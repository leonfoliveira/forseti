package com.forsetijudge.core.port.driving.usecase.internal.attachment

import com.forsetijudge.core.domain.entity.Attachment

interface DownloadAttachmentInternalUseCase {
    /**
     * Downloads an attachment by its ID and returns the download metadata.
     *
     * @param command The command containing the ID of the attachment to be downloaded.
     * @return The attachment download output data including metadata.
     */
    fun execute(command: Command): ByteArray

    /**
     * Command class for downloading an attachment.
     *
     * @param attachment The attachment entity to be downloaded.
     */
    data class Command(
        val attachment: Attachment,
    )
}
