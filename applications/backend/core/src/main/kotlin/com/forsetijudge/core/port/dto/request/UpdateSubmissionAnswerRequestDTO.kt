package com.forsetijudge.core.port.dto.request

import com.forsetijudge.core.domain.entity.Submission
import jakarta.validation.constraints.NotNull

data class UpdateSubmissionAnswerRequestDTO(
    @NotNull
    val answer: Submission.Answer,
)
