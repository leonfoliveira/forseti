package io.github.leonfoliveira.judge.common.service.dto.input.submission

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import java.util.UUID

data class UpdateSubmissionInputDTO(
    val submissionId: UUID,
    val status: Submission.Status,
    val answer: Submission.Answer,
)
