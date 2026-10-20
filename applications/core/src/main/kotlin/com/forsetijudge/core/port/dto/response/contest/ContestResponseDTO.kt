package com.forsetijudge.core.port.dto.response.contest

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Submission
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class ContestResponseDTO(
    val id: UUID,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,
    val slug: String,
    val title: String,
    val languages: List<Submission.Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
    val autoFreezeAt: OffsetDateTime?,
    val frozenAt: OffsetDateTime?,
    val version: Long,
) : Serializable

fun Contest.toResponseDTO(): ContestResponseDTO =
    ContestResponseDTO(
        id = this.id,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        slug = this.slug,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
        autoFreezeAt = this.autoFreezeAt,
        frozenAt = this.frozenAt,
        version = this.version,
    )
