package com.forsetijudge.core.port.dto.response.problem

import com.forsetijudge.core.domain.entity.Problem
import com.forsetijudge.core.port.dto.response.attachment.AttachmentResponseDTO
import com.forsetijudge.core.port.dto.response.attachment.toResponseDTO
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class ProblemResponseDTO(
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

fun Problem.toResponseDTO(): ProblemResponseDTO =
    ProblemResponseDTO(
        id = this.id,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        letter = this.letter,
        color = this.color,
        title = this.title,
        description = this.description.toResponseDTO(),
        timeLimit = this.timeLimitMs,
        memoryLimit = this.memoryLimitMb,
        version = this.version,
    )
