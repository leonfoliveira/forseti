package io.github.leonfoliveira.forseti.common.port

import io.github.leonfoliveira.forseti.common.domain.entity.Attachment

interface AttachmentBucket {
    fun upload(
        attachment: Attachment,
        bytes: ByteArray,
    )

    fun download(attachment: Attachment): ByteArray
}
