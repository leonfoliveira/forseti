package io.leonfoliveira.judge.core.port

import io.leonfoliveira.judge.core.entity.model.Attachment
import io.leonfoliveira.judge.core.entity.model.RawAttachment

interface S3Adapter {
    fun upload(rawAttachment: RawAttachment): Attachment
}