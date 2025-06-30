package io.github.leonfoliveira.judge.api.dto.response.problem

import io.github.leonfoliveira.judge.api.dto.response.AttachmentResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.toResponseDTO
import io.github.leonfoliveira.judge.common.domain.entity.Problem
import java.util.UUID

data class ProblemPublicResponseDTO(
    val id: UUID,
    val letter: Char,
    val title: String,
    val description: AttachmentResponseDTO,
)

fun Problem.toPublicResponseDTO(): ProblemPublicResponseDTO {
    return ProblemPublicResponseDTO(
        id = this.id,
        letter = this.letter,
        title = this.title,
        description = this.description.toResponseDTO(),
    )
}
