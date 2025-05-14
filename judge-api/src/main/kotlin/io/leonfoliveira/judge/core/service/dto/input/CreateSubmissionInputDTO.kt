package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.RawAttachment

data class CreateSubmissionInputDTO(
    val language: Language,
    val code: RawAttachment,
)
