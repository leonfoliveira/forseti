package io.leonfoliveira.judge.api.dto.response

import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime
import java.util.UUID

class ContestFullResponseDTO(
    val id: UUID,
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
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
        members = this.members.map { it.toFullResponseDTO() },
        problems = this.problems.map { it.toFullResponseDTO() },
    )
}
