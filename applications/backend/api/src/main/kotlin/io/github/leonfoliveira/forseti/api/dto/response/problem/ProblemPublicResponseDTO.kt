package io.github.leonfoliveira.forseti.api.dto.response.problem

import io.github.leonfoliveira.forseti.api.dto.response.AttachmentResponseDTO
import io.github.leonfoliveira.forseti.api.dto.response.toResponseDTO
import io.github.leonfoliveira.forseti.common.domain.entity.Problem
import java.util.UUID

data class ProblemPublicResponseDTO(
    val id: UUID,
    val letter: Char,
    val title: String,
    val description: AttachmentResponseDTO,
)

fun Problem.toPublicResponseDTO(): ProblemPublicResponseDTO =
    ProblemPublicResponseDTO(
        id = this.id,
        letter = this.letter,
        title = this.title,
        description = this.description.toResponseDTO(),
    )
