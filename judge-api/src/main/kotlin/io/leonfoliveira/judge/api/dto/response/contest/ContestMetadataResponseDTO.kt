package io.leonfoliveira.judge.api.dto.response.contest

import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime
import java.util.UUID

class ContestMetadataResponseDTO(
    val id: UUID,
    val slug: String,
    val title: String,
    val languages: List<Language>,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
)

fun Contest.toMetadataDTO(): ContestMetadataResponseDTO {
    return ContestMetadataResponseDTO(
        id = this.id,
        slug = this.slug,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
    )
}
