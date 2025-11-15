package io.github.leonfoliveira.forseti.api.adapter.dto.response.contest

import io.github.leonfoliveira.forseti.api.adapter.dto.response.announcement.AnnouncementResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.announcement.toResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.clarification.ClarificationResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.clarification.toResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.member.MemberFullResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.member.toFullResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.problem.ProblemFullResponseDTO
import io.github.leonfoliveira.forseti.api.adapter.dto.response.problem.toFullResponseDTO
import io.github.leonfoliveira.forseti.common.application.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
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
)

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
