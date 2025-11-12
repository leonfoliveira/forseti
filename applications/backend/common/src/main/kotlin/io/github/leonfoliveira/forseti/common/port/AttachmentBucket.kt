package io.github.leonfoliveira.forseti.common.port

import io.github.leonfoliveira.forseti.common.domain.entity.Attachment

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
