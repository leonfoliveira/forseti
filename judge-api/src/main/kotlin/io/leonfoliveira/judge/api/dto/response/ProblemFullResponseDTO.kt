package io.leonfoliveira.judge.api.dto.response

import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.domain.model.Attachment

data class ProblemFullResponseDTO(
    val id: Int,
    val title: String,
    val description: String,
    val timeLimit: Int,
    val testCases: Attachment,
)

fun Problem.toFullResponseDTO(): ProblemFullResponseDTO {
    return ProblemFullResponseDTO(
        id = this.id,
        title = this.title,
        description = this.description,
        timeLimit = this.timeLimit,
        testCases = this.testCases,
    )
}
