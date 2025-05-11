package io.leonfoliveira.judge.api.dto.response

import io.leonfoliveira.judge.core.entity.Problem
import io.leonfoliveira.judge.core.entity.model.Attachment

data class ProblemResponseDTO(
    val id: Int,
    val title: String,
    val description: String,
    val timeLimit: Int,
    val testCases: Attachment,
)

fun Problem.toResponseDTO(): ProblemResponseDTO {
    return ProblemResponseDTO(
        id = this.id,
        title = this.title,
        description = this.description,
        timeLimit = this.timeLimit,
        testCases = this.testCases,
    )
}
