package io.leonfoliveira.judge.api.controller.dto.response

import io.leonfoliveira.judge.core.domain.entity.Attachment
import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime

data class ContestPublicResponseDTO(
    val id: Int,
    val title: String,
    val languages: List<Language>,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
    val members: List<MemberDTO>,
    val problems: List<ProblemDTO>,
) {
    data class MemberDTO(
        val id: Int,
        val type: String,
        val name: String,
    )

    data class ProblemDTO(
        val id: Int,
        val title: String,
        val description: Attachment,
    )
}

fun Contest.toPublicResponseDTO(): ContestPublicResponseDTO {
    return ContestPublicResponseDTO(
        id = this.id,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
        members = this.members.map { member ->
            ContestPublicResponseDTO.MemberDTO(
                id = member.id,
                type = member.type.name,
                name = member.name
            )
        },
        problems = this.problems.map { problem ->
            ContestPublicResponseDTO.ProblemDTO(
                id = problem.id,
                title = problem.title,
                description = problem.description
            )
        }
    )
}