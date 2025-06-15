package io.github.leonfoliveira.judge.core.service.dto.input.submission

import io.github.leonfoliveira.judge.core.domain.entity.Submission
import java.util.UUID

data class UpdateSubmissionInputDTO(
    val submissionId: UUID,
    val status: Submission.Status,
    val answer: Submission.Answer,
)
