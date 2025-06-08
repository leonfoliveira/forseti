package io.leonfoliveira.judge.api.dto.response.contest

import io.leonfoliveira.judge.api.dto.response.member.MemberFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.member.toFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.problem.ProblemFullResponseDTO
import io.leonfoliveira.judge.api.dto.response.problem.toFullResponseDTO
import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime
import java.util.UUID

class ContestFullResponseDTO(
    val id: UUID,
    val slug: String,
    val title: String,
    val languages: List<Language>,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
    val members: List<MemberFullResponseDTO>,
    val problems: List<ProblemFullResponseDTO>,
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
    )
}
