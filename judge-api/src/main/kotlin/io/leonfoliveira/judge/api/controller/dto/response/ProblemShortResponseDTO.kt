package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Problem
import java.util.UUID

data class ProblemShortResponseDTO(
    val id: Int,
    val title: String,
    val descriptionKey: UUID,
)

fun Problem.toShortResponseDTO(): ProblemShortResponseDTO {
    return ProblemShortResponseDTO(
        id = this.id,
        title = this.title,
        descriptionKey = this.description.key,
    )
}
