package io.leonfoliveira.judge.core.service.dto.input.submission

import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.service.dto.input.attachment.AttachmentInputDTO
import java.util.UUID

data class CreateSubmissionInputDTO(
    val problemId: UUID,
    val language: Language,
    val code: AttachmentInputDTO,
)