package com.forsetijudge.core.port.driving.usecase.attachment

import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.port.dto.output.AttachmentDownloadOutputDTO
import java.util.UUID

interface DownloadAttachmentUseCase {
    /**
     * Downloads an attachment by its ID and returns the download metadata.
     *
     * @param id The ID of the attachment to download.
     * @return The attachment download output data including metadata.
     */
    fun download(id: UUID): AttachmentDownloadOutputDTO

    /**
     * Downloads the raw binary content of an attachment.
     *
     * @param attachment The attachment entity to download.
     * @return The binary content of the attachment as a byte array.
     */
    fun download(attachment: Attachment): ByteArray
}
