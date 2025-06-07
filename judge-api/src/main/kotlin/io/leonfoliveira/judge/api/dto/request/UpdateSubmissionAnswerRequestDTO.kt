package io.leonfoliveira.judge.api.dto.request

import io.leonfoliveira.judge.core.domain.entity.Submission

data class UpdateSubmissionAnswerRequestDTO(
    val answer: Submission.Answer,
)
