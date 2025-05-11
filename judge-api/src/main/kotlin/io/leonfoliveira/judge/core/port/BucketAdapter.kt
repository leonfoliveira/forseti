package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.entity.model.Attachment
import io.leonfoliveira.judge.core.entity.model.RawAttachment

interface BucketAdapter {
    fun upload(rawAttachment: RawAttachment): Attachment
}