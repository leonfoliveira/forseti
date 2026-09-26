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
}
