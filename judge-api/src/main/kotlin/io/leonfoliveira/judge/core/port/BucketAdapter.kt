package io.leonfoliveira.judge.core.port

import java.util.UUID

interface BucketAdapter {
    fun upload(
        bytes: ByteArray,
        key: UUID,
    )

    fun download(key: UUID): ByteArray
}
