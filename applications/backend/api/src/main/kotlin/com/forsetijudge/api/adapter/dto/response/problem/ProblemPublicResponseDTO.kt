package com.forsetijudge.api.adapter.dto.response.problem

import com.forsetijudge.api.adapter.dto.response.AttachmentResponseDTO
import com.forsetijudge.api.adapter.dto.response.toResponseDTO
import com.forsetijudge.core.domain.entity.Problem
import java.io.Serializable
import java.util.UUID

data class ProblemPublicResponseDTO(
    val id: UUID,
    val letter: Char,
    val color: String,
    val title: String,
    val description: AttachmentResponseDTO,
    val timeLimit: Int,
    val memoryLimit: Int,
    val version: Long,
) : Serializable

fun Problem.toPublicResponseDTO(): ProblemPublicResponseDTO =
    ProblemPublicResponseDTO(
        id = this.id,
        letter = this.letter,
        color = this.color,
        title = this.title,
        description = this.description.toResponseDTO(),
        timeLimit = this.timeLimit,
        memoryLimit = this.memoryLimit,
        version = this.version,
    )
