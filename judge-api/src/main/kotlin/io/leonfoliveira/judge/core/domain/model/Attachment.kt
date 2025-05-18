package io.leonfoliveira.judge.core.domain.model

import jakarta.persistence.Embeddable
import jakarta.validation.constraints.NotBlank

@Embeddable
data class Attachment(
    @field:NotBlank
    val filename: String,
    @field:NotBlank
    val key: String,
)
