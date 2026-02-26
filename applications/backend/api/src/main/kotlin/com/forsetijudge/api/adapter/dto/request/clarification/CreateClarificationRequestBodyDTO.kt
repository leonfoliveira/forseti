package com.forsetijudge.api.adapter.dto.request.clarification

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.util.UUID

@JsonIgnoreProperties(ignoreUnknown = true)
data class CreateClarificationRequestBodyDTO(
    val problemId: UUID? = null,
    val parentId: UUID? = null,
    val text: String,
)
