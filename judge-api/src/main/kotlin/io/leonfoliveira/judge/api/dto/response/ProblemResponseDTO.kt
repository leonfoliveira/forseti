package io.leonfoliveira.judge.api.dto.response

import io.leonfoliveira.judge.core.domain.entity.Problem

data class ProblemResponseDTO(
    val id: Int,
    val title: String,
    val description: String,
)

fun Problem.toResponseDTO(): ProblemResponseDTO {
    return ProblemResponseDTO(
        id = this.id,
        title = this.title,
        description = this.description,
    )
}
