package live.forseti.api.adapter.dto.response.contest

import live.forseti.api.adapter.dto.response.announcement.AnnouncementResponseDTO
import live.forseti.api.adapter.dto.response.announcement.toResponseDTO
import live.forseti.api.adapter.dto.response.clarification.ClarificationResponseDTO
import live.forseti.api.adapter.dto.response.clarification.toResponseDTO
import live.forseti.api.adapter.dto.response.member.MemberPublicResponseDTO
import live.forseti.api.adapter.dto.response.member.toPublicResponseDTO
import live.forseti.api.adapter.dto.response.problem.ProblemPublicResponseDTO
import live.forseti.api.adapter.dto.response.problem.toPublicResponseDTO
import live.forseti.core.domain.entity.Contest
import live.forseti.core.domain.entity.Submission
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
)

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
    )
