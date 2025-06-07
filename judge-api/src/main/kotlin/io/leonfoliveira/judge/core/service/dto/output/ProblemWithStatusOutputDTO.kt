package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Attachment
import java.util.UUID

data class ProblemWithStatusOutputDTO(
    val id: UUID,
    val title: String,
    val description: Attachment,
    val isAccepted: Boolean,
    val wrongSubmissions: Int,
)
