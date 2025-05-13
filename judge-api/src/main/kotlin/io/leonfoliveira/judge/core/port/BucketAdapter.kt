package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.domain.model.Attachment
import io.leonfoliveira.judge.core.domain.model.RawAttachment

interface BucketAdapter {
    fun upload(rawAttachment: RawAttachment): Attachment

    fun download(attachment: Attachment): ByteArray
}
