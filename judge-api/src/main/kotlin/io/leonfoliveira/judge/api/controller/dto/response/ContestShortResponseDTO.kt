package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.service.dto.output.ContestOutputDTO
import java.time.LocalDateTime

class ContestShortResponseDTO(
    val id: Int,
    val title: String,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
)

fun ContestOutputDTO.toShortResponseDTO(): ContestShortResponseDTO {
    return ContestShortResponseDTO(
        id = this.id,
        title = this.title,
        startAt = this.startAt,
        endAt = this.endAt,
    )
}
