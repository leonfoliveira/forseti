package com.forsetijudge.core.port.dto.response.problem

import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.port.dto.response.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.toResponseBodyDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class ProblemResponseBodyDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val letter: Char,
    val color: String,
    val title: String,
    val description: AttachmentResponseDTO,
    val timeLimit: Int,
    val memoryLimit: Int,
    val version: Long,
) : Serializable

fun Problem.toResponseBodyDTO(): ProblemResponseBodyDTO =
    ProblemResponseBodyDTO(
        id = this.id,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        letter = this.letter,
        color = this.color,
        title = this.title,
        description = this.description.toResponseBodyDTO(),
        timeLimit = this.timeLimit,
        memoryLimit = this.memoryLimit,
        version = this.version,
    )
