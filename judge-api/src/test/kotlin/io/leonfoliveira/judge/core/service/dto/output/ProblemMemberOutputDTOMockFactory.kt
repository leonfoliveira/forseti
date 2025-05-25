package io.leonfoliveira.judge.core.service.dto.output

import java.util.UUID

object ProblemMemberOutputDTOMockFactory {
    fun build(
        id: Int = 1,
        title: String = "Problem",
        descriptionKey: UUID = UUID.randomUUID(),
        isAccepted: Boolean = false,
        wrongSubmissions: Int = 0,
    ): ProblemMemberOutputDTO {
        return ProblemMemberOutputDTO(
            id = id,
            title = title,
            descriptionKey = descriptionKey,
            isAccepted = isAccepted,
            wrongSubmissions = wrongSubmissions,
        )
    }
}
