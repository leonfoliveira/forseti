package io.github.leonfoliveira.judge.common.service.dto.input.submission

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.service.dto.input.attachment.AttachmentInputDTO
import java.util.UUID

data class CreateSubmissionInputDTO(
    val problemId: UUID,
    val language: Submission.Language,
    val code: AttachmentInputDTO,
)
