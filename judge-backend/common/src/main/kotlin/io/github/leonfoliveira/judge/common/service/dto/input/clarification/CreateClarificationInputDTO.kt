package io.github.leonfoliveira.judge.common.service.dto.input.clarification

import java.util.UUID

data class CreateClarificationInputDTO(
    val problemId: UUID? = null,
    val parentId: UUID? = null,
    val text: String,
)
