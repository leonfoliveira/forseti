package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.model.DownloadAttachment
import io.leonfoliveira.judge.core.service.dto.output.ProblemOutputDTO

data class ProblemResponseDTO(
    val id: Int,
    val title: String,
    val description: String,
    val timeLimit: Int,
    val testCases: DownloadAttachment,
)

fun ProblemOutputDTO.toFullResponseDTO(): ProblemResponseDTO {
    return ProblemResponseDTO(
        id = id,
        title = title,
        description = description,
        timeLimit = timeLimit,
        testCases = testCases,
    )
}
