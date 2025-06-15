package io.github.leonfoliveira.judge.core.port

import io.github.leonfoliveira.judge.core.domain.entity.Attachment

interface BucketAdapter {
    fun upload(
        attachment: Attachment,
        bytes: ByteArray,
    )

    fun download(attachment: Attachment): ByteArray
}
