package io.leonfoliveira.judge.core.service.dto.output

import java.util.UUID

object ProblemOutputDTOMockFactory {
    fun build(
        id: Int = 1,
        title: String = "Problem Title",
        descriptionKey: UUID = UUID.randomUUID(),
        timeLimit: Int = 1000,
        testCasesKey: UUID = UUID.randomUUID(),
    ) = ProblemOutputDTO(
        id = id,
        title = title,
        descriptionKey = descriptionKey,
        timeLimit = timeLimit,
        testCasesKey = testCasesKey,
    )
}
