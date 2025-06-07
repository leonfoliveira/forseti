package io.leonfoliveira.judge.api.controller.dto.request

import io.leonfoliveira.judge.core.domain.entity.Submission

data class UpdateSubmissionStatusRequestDTO(
    val status: Submission.Status,
)
