package io.leonfoliveira.judge.api.dto.response

import io.leonfoliveira.judge.core.domain.entity.Problem
import java.util.UUID

data class ProblemPublicResponseDTO(
    val id: UUID,
    val title: String,
    val description: AttachmentResponseDTO,
)

fun Problem.toPublicResponseDTO(): ProblemPublicResponseDTO {
    return ProblemPublicResponseDTO(
        id = this.id,
        title = this.title,
        description = this.description.toResponseDTO(),
    )
}
