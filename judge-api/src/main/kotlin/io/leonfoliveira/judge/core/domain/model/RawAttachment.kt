package io.leonfoliveira.judge.core.domain.model

import jakarta.validation.constraints.NotEmpty

class RawAttachment(
    @field:NotEmpty
    val filename: String,
    val content: ByteArray,
)
