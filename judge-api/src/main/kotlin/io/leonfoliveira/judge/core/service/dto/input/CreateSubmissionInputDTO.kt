package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.util.UUID

data class CreateSubmissionInputDTO(
    val problemId: UUID,
    val language: Language,
    val code: AttachmentInputDTO,
)
