package io.leonfoliveira.judge.core.service.dto.output

import java.util.UUID

data class ProblemMemberOutputDTO(
    val id: Int,
    val title: String,
    val descriptionKey: UUID,
    val isAccepted: Boolean,
    val wrongSubmissions: Int,
)
