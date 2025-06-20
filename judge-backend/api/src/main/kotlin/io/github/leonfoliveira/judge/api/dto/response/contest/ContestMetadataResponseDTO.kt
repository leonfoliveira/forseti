package io.github.leonfoliveira.judge.api.dto.response.contest

import io.github.leonfoliveira.judge.common.domain.entity.Contest
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import java.time.OffsetDateTime
import java.util.UUID

class ContestMetadataResponseDTO(
    val id: UUID,
    val slug: String,
    val title: String,
    val languages: List<Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
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
