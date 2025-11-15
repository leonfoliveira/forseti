package io.github.leonfoliveira.forseti.api.adapter.dto.response.contest

import io.github.leonfoliveira.forseti.common.application.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import java.time.OffsetDateTime
import java.util.UUID

class ContestMetadataResponseDTO(
    val id: UUID,
    val slug: String,
    val title: String,
    val languages: List<Submission.Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
)

fun Contest.toMetadataDTO(): ContestMetadataResponseDTO =
    ContestMetadataResponseDTO(
        id = this.id,
        slug = this.slug,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
    )
