package live.forseti.api.adapter.dto.response.problem

import live.forseti.api.adapter.dto.response.AttachmentResponseDTO
import live.forseti.api.adapter.dto.response.toResponseDTO
import live.forseti.core.domain.entity.Problem
import java.io.Serializable
import java.util.UUID

data class ProblemFullResponseDTO(
    val id: UUID,
    val letter: Char,
    val title: String,
    val description: AttachmentResponseDTO,
    val timeLimit: Int,
    val memoryLimit: Int,
    val testCases: AttachmentResponseDTO,
) : Serializable

fun Problem.toFullResponseDTO(): ProblemFullResponseDTO =
    ProblemFullResponseDTO(
        id = id,
        letter = letter,
        title = title,
        description = description.toResponseDTO(),
        timeLimit = timeLimit,
        memoryLimit = memoryLimit,
        testCases = testCases.toResponseDTO(),
    )
