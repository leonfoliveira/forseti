package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.RawAttachment
import jakarta.validation.Valid

data class CreateSubmissionInputDTO(
    val language: Language,
    @field:Valid
    val code: RawAttachment,
)
