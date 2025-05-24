package io.leonfoliveira.judge.core.service.dto.output

data class ProblemMemberOutputDTO(
    val id: Int,
    val title: String,
    val description: String,
    val isAccepted: Boolean,
    val wrongSubmissions: Int,
)
