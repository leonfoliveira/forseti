package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Problem

data class ProblemPublicResponseDTO(
    val id: Int,
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
