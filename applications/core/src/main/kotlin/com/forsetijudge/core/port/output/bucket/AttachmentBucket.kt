package com.forsetijudge.core.port.output.bucket

import com.forsetijudge.core.domain.entity.Attachment

interface AttachmentBucket {
    /**
     * Returns the download URL for an attachment
     *
     * @param attachment the attachment metadata
     * @return the download URL
     */
    fun getDownloadUrl(attachment: Attachment): String

    /**
     * Returns the upload URL for an attachment
     *
     * @param attachment the attachment metadata
     * @return the upload URL
     */
    fun getUploadUrl(attachment: Attachment): String

    /**
     * Downloads the attachment data
     *
     * @param attachment the attachment metadata
     * @return the attachment data as a byte array
     */
    fun download(attachment: Attachment): ByteArray

    /**
     * Uploads the attachment data
     *
     * @param attachment the attachment metadata
     * @param data the attachment data as a byte array
     */
    fun upload(
        attachment: Attachment,
        data: ByteArray,
    )
}
