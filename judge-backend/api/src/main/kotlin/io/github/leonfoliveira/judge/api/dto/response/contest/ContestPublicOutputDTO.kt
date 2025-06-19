package io.github.leonfoliveira.judge.api.dto.response.contest

import io.github.leonfoliveira.judge.api.dto.response.announcement.AnnouncementResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.announcement.toResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.clarification.ClarificationResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.clarification.toResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.member.MemberPublicResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.member.toPublicResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.problem.ProblemPublicResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.problem.toPublicResponseDTO
import io.github.leonfoliveira.judge.core.domain.entity.Contest
import io.github.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.OffsetDateTime
import java.util.UUID

data class ContestPublicOutputDTO(
    val id: UUID,
    val slug: String,
    val title: String,
    val languages: List<Language>,
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
    val members: List<MemberPublicResponseDTO>,
    val problems: List<ProblemPublicResponseDTO>,
    val clarifications: List<ClarificationResponseDTO>,
    val announcements: List<AnnouncementResponseDTO>,
)

fun Contest.toPublicOutputDTO(): ContestPublicOutputDTO {
    return ContestPublicOutputDTO(
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
    )
}
