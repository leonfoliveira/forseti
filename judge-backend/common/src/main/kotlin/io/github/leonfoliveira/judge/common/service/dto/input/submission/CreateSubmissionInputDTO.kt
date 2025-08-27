package io.github.leonfoliveira.judge.common.service.dto.input.submission

import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.service.dto.input.attachment.AttachmentInputDTO
import java.util.UUID

data class CreateSubmissionInputDTO(
    val problemId: UUID,
    val language: Language,
    val code: AttachmentInputDTO,
)
