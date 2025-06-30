package io.github.leonfoliveira.judge.common.service.dto.input.submission

import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.service.dto.input.attachment.AttachmentInputDTO

data class CreateSubmissionInputDTO(
    val language: Language,
    val code: AttachmentInputDTO,
)
