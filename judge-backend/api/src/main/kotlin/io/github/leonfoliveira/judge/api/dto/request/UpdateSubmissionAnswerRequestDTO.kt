package io.github.leonfoliveira.judge.api.dto.request

import io.github.leonfoliveira.judge.core.domain.entity.Submission

data class UpdateSubmissionAnswerRequestDTO(
    val answer: Submission.Answer,
)
