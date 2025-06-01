package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.enumerate.Language

data class CreateSubmissionInputDTO(
    val problemId: Int,
    val language: Language,
    val code: AttachmentInputDTO,
)
