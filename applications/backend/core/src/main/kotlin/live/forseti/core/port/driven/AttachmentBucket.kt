package live.forseti.core.port.driven

import live.forseti.core.domain.entity.Attachment

interface AttachmentBucket {
    /**
     * Uploads an attachment to the bucket
     *
     * @param attachment the attachment metadata
     * @param bytes the attachment content
     */
    fun upload(
        attachment: Attachment,
        bytes: ByteArray,
    )

    /**
     * Downloads an attachment from the bucket
     *
     * @param attachment the attachment metadata
     * @return the attachment content
     */
    fun download(attachment: Attachment): ByteArray
}
