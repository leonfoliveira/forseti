package com.forsetijudge.api.adapter.dto.request.contest

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.forsetijudge.core.domain.entity.Submission
import java.time.OffsetDateTime

@JsonIgnoreProperties(ignoreUnknown = true)
data class CreateContestRequestBodyDTO(
    val slug: String,
    val title: String,
    val languages: List<Submission.Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
)
