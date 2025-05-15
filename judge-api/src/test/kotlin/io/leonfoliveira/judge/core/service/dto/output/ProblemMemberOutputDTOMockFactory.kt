package io.leonfoliveira.judge.core.service.dto.output

object ProblemMemberOutputDTOMockFactory {
    fun build(
        id: Int = 1,
        title: String = "Problem",
        wrongAnswers: Int = 0,
        acceptedAnswers: Int = 0,
    ): ProblemMemberOutputDTO {
        return ProblemMemberOutputDTO(
            id = id,
            title = title,
            wrongAnswers = wrongAnswers,
            acceptedAnswers = acceptedAnswers,
        )
    }
}
