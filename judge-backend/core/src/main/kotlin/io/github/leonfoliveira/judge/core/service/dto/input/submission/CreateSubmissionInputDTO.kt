package io.github.leonfoliveira.judge.core.service.dto.input.submission

import io.github.leonfoliveira.judge.core.domain.enumerate.Language
import io.github.leonfoliveira.judge.core.service.dto.input.attachment.AttachmentInputDTO

data class CreateSubmissionInputDTO(
    val language: Language,
    val code: AttachmentInputDTO,
)
