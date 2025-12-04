package com.forsetijudge.api.adapter.dto.response.contest

import com.forsetijudge.api.adapter.dto.response.announcement.AnnouncementResponseDTO
import com.forsetijudge.api.adapter.dto.response.announcement.toResponseDTO
import com.forsetijudge.api.adapter.dto.response.clarification.ClarificationResponseDTO
import com.forsetijudge.api.adapter.dto.response.clarification.toResponseDTO
import com.forsetijudge.api.adapter.dto.response.member.MemberFullResponseDTO
import com.forsetijudge.api.adapter.dto.response.member.toFullResponseDTO
import com.forsetijudge.api.adapter.dto.response.problem.ProblemFullResponseDTO
import com.forsetijudge.api.adapter.dto.response.problem.toFullResponseDTO
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Submission
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.UUID

class ContestFullResponseDTO(
    val id: UUID,
    val slug: String,
    val title: String,
    val languages: List<Submission.Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
    val settings: Contest.Settings,
    val members: List<MemberFullResponseDTO>,
    val problems: List<ProblemFullResponseDTO>,
    val clarifications: List<ClarificationResponseDTO>,
    val announcements: List<AnnouncementResponseDTO>,
) : Serializable

fun Contest.toFullResponseDTO(): ContestFullResponseDTO =
    ContestFullResponseDTO(
        id = this.id,
        slug = this.slug,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
        settings = this.settings,
        members = this.members.map { it.toFullResponseDTO() },
        problems = this.problems.map { it.toFullResponseDTO() },
        clarifications = this.clarifications.map { it.toResponseDTO() },
        announcements = this.announcements.map { it.toResponseDTO() },
    )
