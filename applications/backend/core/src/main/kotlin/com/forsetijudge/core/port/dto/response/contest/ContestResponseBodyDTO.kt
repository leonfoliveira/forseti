package com.forsetijudge.core.port.dto.response.contest

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Submission
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class ContestResponseBodyDTO(
    val id: UUID,
    val slug: String,
    val title: String,
    val languages: List<Submission.Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
    val version: Long,
) : Serializable

fun Contest.toResponseBodyDTO(): ContestResponseBodyDTO =
    ContestResponseBodyDTO(
        id = this.id,
        slug = this.slug,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
        version = this.version,
    )
