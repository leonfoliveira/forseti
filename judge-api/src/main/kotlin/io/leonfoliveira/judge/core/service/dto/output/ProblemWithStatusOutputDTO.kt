package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Attachment

data class ProblemWithStatusOutputDTO(
    val id: Int,
    val title: String,
    val description: Attachment,
    val isAccepted: Boolean,
    val wrongSubmissions: Int,
)
