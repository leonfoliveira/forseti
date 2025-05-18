package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Problem

data class ProblemShortResponseDTO(
    val id: Int,
    val title: String,
    val description: String,
)

fun Problem.toShortResponseDTO(): ProblemShortResponseDTO {
    return ProblemShortResponseDTO(
        id = this.id,
        title = this.title,
        description = this.description,
    )
}
