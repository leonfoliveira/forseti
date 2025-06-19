package io.github.leonfoliveira.judge.api.dto.response.contest

import io.github.leonfoliveira.judge.api.dto.response.announcement.AnnouncementResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.announcement.toResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.clarification.ClarificationResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.clarification.toResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.member.MemberFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.member.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.problem.ProblemFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.problem.toFullResponseDTO
import io.github.leonfoliveira.judge.core.domain.entity.Contest
import io.github.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.OffsetDateTime
import java.util.UUID

class ContestFullResponseDTO(
    val id: UUID,
    val slug: String,
    val title: String,
    val languages: List<Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
    val members: List<MemberFullResponseDTO>,
    val problems: List<ProblemFullResponseDTO>,
    val clarifications: List<ClarificationResponseDTO>,
    val announcements: List<AnnouncementResponseDTO>,
)

fun Contest.toFullResponseDTO(): ContestFullResponseDTO {
    return ContestFullResponseDTO(
        id = this.id,
        slug = this.slug,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
        members = this.members.map { it.toFullResponseDTO() },
        problems = this.problems.map { it.toFullResponseDTO() },
        clarifications = this.clarifications.map { it.toResponseDTO() },
        announcements = this.announcements.map { it.toResponseDTO() },
    )
}
