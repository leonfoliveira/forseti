package com.forsetijudge.api.adapter.dto.response.problem

import com.forsetijudge.api.adapter.dto.response.AttachmentResponseDTO
import com.forsetijudge.api.adapter.dto.response.toResponseDTO
import com.forsetijudge.core.domain.entity.Problem
import java.io.Serializable
import java.util.UUID

data class ProblemPublicResponseDTO(
    val id: UUID,
    val letter: Char,
    val title: String,
    val description: AttachmentResponseDTO,
) : Serializable

fun Problem.toPublicResponseDTO(): ProblemPublicResponseDTO =
    ProblemPublicResponseDTO(
        id = this.id,
        letter = this.letter,
        title = this.title,
        description = this.description.toResponseDTO(),
    )
