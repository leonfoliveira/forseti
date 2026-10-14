package com.forsetijudge.core.api.http.dto.request.clarification

import java.util.UUID

data class CreateClarificationRequestBody(
    val problemId: UUID?,
    val text: String,
)
