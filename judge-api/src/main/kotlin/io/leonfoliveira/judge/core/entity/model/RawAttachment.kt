package io.leonfoliveira.judge.core.entity.model

import java.util.Base64

data class RawAttachment(
    val filename: String,
    val base64: Base64,
)
