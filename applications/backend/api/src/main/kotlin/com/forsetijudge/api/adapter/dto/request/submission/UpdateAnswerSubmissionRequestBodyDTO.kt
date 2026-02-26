package com.forsetijudge.api.adapter.dto.request.submission

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.forsetijudge.core.domain.entity.Submission

@JsonIgnoreProperties(ignoreUnknown = true)
data class UpdateAnswerSubmissionRequestBodyDTO(
    val answer: Submission.Answer,
)
