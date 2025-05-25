package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.enumerate.Language
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import java.util.UUID

data class CreateSubmissionInputDTO(
    val language: Language,
    val codeKey: UUID,
)
