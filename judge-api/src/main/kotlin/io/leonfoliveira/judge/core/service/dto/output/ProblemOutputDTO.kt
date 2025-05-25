package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Problem
import io.leonfoliveira.judge.core.port.BucketAdapter
import java.util.UUID

data class ProblemOutputDTO(
    val id: Int,
    val title: String,
    val descriptionKey: UUID,
    val timeLimit: Int,
    val testCasesKey: UUID,
)

fun Problem.toOutputDTO(): ProblemOutputDTO {
    return ProblemOutputDTO(
        id = this.id,
        title = this.title,
        descriptionKey = this.description.key,
        timeLimit = this.timeLimit,
        testCasesKey = this.testCases.key,
    )
}
