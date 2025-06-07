package io.leonfoliveira.judge.api.dto.response

import io.leonfoliveira.judge.core.service.dto.output.ProblemWithStatusOutputDTO
import java.util.UUID

data class ProblemWithStatusResponseDTO(
    val id: UUID,
    val title: String,
    val description: AttachmentResponseDTO,
    val isAccepted: Boolean,
    val wrongSubmissions: Int,
)

fun ProblemWithStatusOutputDTO.toResponseDTO() =
    ProblemWithStatusResponseDTO(
        id = this.id,
        title = this.title,
        description = this.description.toResponseDTO(),
        isAccepted = this.isAccepted,
        wrongSubmissions = this.wrongSubmissions,
    )
