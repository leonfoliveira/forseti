package io.leonfoliveira.judge.core.service.dto.output

data class ProblemMemberOutputDTO(
    val id: Int,
    val title: String,
    val wrongAnswers: Int,
    val correctAnswers: Int,
)
