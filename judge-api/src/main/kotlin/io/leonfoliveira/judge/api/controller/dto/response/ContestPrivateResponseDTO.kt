package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime

class ContestPrivateResponseDTO(
    val id: Int,
    val title: String,
    val languages: List<Language>,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
    val members: List<MemberResponseDTO>,
    val problems: List<ProblemPrivateResponseDTO>,
)

fun Contest.toPrivateResponseDTO(): ContestPrivateResponseDTO {
    return ContestPrivateResponseDTO(
        id = this.id,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
        members = this.members.map { it.toPrivateResponseDTO() },
        problems = this.problems.map { it.toPrivateResponseDTO() },
    )
}
