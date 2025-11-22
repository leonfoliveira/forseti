package live.forseti.core.port.driven

import live.forseti.core.domain.entity.Attachment

interface AttachmentBucket {
    /**
     * Uploads an attachment to the bucket
     */
    fun upload(
        attachment: Attachment,
        bytes: ByteArray,
    )

    /**
     * Downloads an attachment from the bucket
     */
    fun download(attachment: Attachment): ByteArray
}
