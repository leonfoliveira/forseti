package io.leonfoliveira.judge.core.service.dto.output

object ProblemMemberOutputDTOMockFactory {
    fun build(
        id: Int = 1,
        title: String = "Problem",
        description: String = "Problem description",
        isAccepted: Boolean = false,
        wrongSubmissions: Int = 0,
    ): ProblemMemberOutputDTO {
        return ProblemMemberOutputDTO(
            id = id,
            title = title,
            description = description,
            isAccepted = isAccepted,
            wrongSubmissions = wrongSubmissions,
        )
    }
}
