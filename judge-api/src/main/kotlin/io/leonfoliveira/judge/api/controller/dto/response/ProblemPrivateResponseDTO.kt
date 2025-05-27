package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Problem

data class ProblemPrivateResponseDTO(
    val id: Int,
    val title: String,
    val description: AttachmentResponseDTO,
    val timeLimit: Int,
    val testCases: AttachmentResponseDTO,
)

fun Problem.toPrivateResponseDTO(): ProblemPrivateResponseDTO {
    return ProblemPrivateResponseDTO(
        id = id,
        title = title,
        description = description.toResponseDTO(),
        timeLimit = timeLimit,
        testCases = testCases.toResponseDTO(),
    )
}
