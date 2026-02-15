package com.forsetijudge.api.adapter.dto.response.contest

import com.forsetijudge.api.adapter.dto.response.announcement.AnnouncementResponseDTO
import com.forsetijudge.api.adapter.dto.response.announcement.toResponseDTO
import com.forsetijudge.api.adapter.dto.response.clarification.ClarificationResponseDTO
import com.forsetijudge.api.adapter.dto.response.clarification.toResponseDTO
import com.forsetijudge.api.adapter.dto.response.member.MemberPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.member.toPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.problem.ProblemPublicResponseDTO
import com.forsetijudge.api.adapter.dto.response.problem.toPublicResponseDTO
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Submission
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

data class ContestPublicOutputDTO(
    val id: UUID,
    val slug: String,
    val title: String,
    val languages: List<Submission.Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
    val members: List<MemberPublicResponseDTO>,
    val problems: List<ProblemPublicResponseDTO>,
    val clarifications: List<ClarificationResponseDTO>,
    val announcements: List<AnnouncementResponseDTO>,
    val version: Long,
) : Serializable

fun Contest.toPublicOutputDTO(): ContestPublicOutputDTO =
    ContestPublicOutputDTO(
        id = this.id,
        slug = this.slug,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
        members = this.members.map { it.toPublicResponseDTO() },
        problems = this.problems.map { it.toPublicResponseDTO() },
        clarifications = this.clarifications.map { it.toResponseDTO() },
        announcements = this.announcements.map { it.toResponseDTO() },
        version = this.version,
    )
