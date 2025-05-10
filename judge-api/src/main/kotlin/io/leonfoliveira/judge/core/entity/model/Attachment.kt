package io.leonfoliveira.judge.core.entity.model

import jakarta.persistence.Embeddable

@Embeddable
data class Attachment(
    val filename: String,
    val key: String,
)