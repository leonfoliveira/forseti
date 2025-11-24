package live.forseti.api.adapter.dto.response.contest

import live.forseti.core.domain.entity.Contest
import live.forseti.core.domain.entity.Submission
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

class ContestMetadataResponseDTO(
    val id: UUID,
    val slug: String,
    val title: String,
    val languages: List<Submission.Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
) : Serializable

fun Contest.toMetadataDTO(): ContestMetadataResponseDTO =
    ContestMetadataResponseDTO(
        id = this.id,
        slug = this.slug,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
    )
