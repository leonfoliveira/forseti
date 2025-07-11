package io.github.leonfoliveira.judge.common.port

import io.github.leonfoliveira.judge.common.domain.entity.Attachment

interface AttachmentBucketAdapter {
    fun upload(
        attachment: Attachment,
        bytes: ByteArray,
    )

    fun download(attachment: Attachment): ByteArray
}
