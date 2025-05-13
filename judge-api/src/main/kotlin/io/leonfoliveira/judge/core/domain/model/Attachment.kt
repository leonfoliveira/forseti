package io.leonfoliveira.judge.core.domain.model

import jakarta.persistence.Embeddable

@Embeddable
data class Attachment(
    val filename: String,
    val key: String,
)
