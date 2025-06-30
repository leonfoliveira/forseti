package io.github.leonfoliveira.judge.api.dto.request

import io.github.leonfoliveira.judge.common.domain.entity.Submission

data class UpdateSubmissionAnswerRequestDTO(
    val answer: Submission.Answer,
)
