package io.github.leonfoliveira.judge.core.service.dto.input.clarification

import java.util.UUID

data class CreateClarificationInputDTO(
    val problemId: UUID?,
    val parentId: UUID?,
    val text: String,
)
