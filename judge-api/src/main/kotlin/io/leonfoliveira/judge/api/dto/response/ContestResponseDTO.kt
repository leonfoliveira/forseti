package io.leonfoliveira.judge.api.dto.response

import io.leonfoliveira.judge.core.entity.Contest
import java.time.LocalDateTime

class ContestResponseDTO(
    val id: Int,
    val title: String,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
)

fun Contest.toResponseDTO(): ContestResponseDTO {
    return ContestResponseDTO(
        id = this.id,
        title = this.title,
        startAt = this.startAt,
        endAt = this.endAt,
    )
}
