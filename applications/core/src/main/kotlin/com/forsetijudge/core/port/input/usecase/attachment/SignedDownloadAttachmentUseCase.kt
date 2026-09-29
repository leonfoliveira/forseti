package com.forsetijudge.core.port.input.usecase.attachment

import com.forsetijudge.core.port.dto.response.attachment.SignedDownloadAttachmentResponseDTO
import java.util.UUID

interface SignedDownloadAttachmentUseCase {
    /**
     * Get metadata and signed download URL for an attachment by its ID and contest ID.
     *
     * @param command The command containing the ID of the attachment to be downloaded.
     * @return A [SignedDownloadAttachmentResponseDTO] containing the attachment metadata and a signed download URL.
     */
    fun execute(command: Command): SignedDownloadAttachmentResponseDTO

    /**
     * Command class for downloading an attachment.
     *
     * @param contestId The ID of the contest associated with the attachment.
     * @param attachmentId The ID of the attachment to be downloaded.
     */
    data class Command(
        val contestId: UUID,
        val attachmentId: UUID,
    )
}
