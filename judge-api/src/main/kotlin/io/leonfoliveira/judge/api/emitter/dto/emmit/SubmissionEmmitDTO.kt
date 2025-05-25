package io.leonfoliveira.judge.api.emitter.dto.emmit

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime

data class SubmissionEmmitDTO(
    val id: Int,
    val problem: ProblemDTO,
    val member: MemberDTO,
    val language: Language,
    val status: Submission.Status,
    val createdAt: LocalDateTime,
) {
    data class ProblemDTO(
        val id: Int,
        val title: String,
    )

    data class MemberDTO(
        val id: Int,
        val name: String,
    )
}

fun Submission.toEmmitDTO(): SubmissionEmmitDTO {
    return SubmissionEmmitDTO(
        id = this.id,
        problem =
            SubmissionEmmitDTO.ProblemDTO(
                id = this.problem.id,
                title = this.problem.title,
            ),
        member =
            SubmissionEmmitDTO.MemberDTO(
                id = this.member.id,
                name = this.member.name,
            ),
        language = this.language,
        status = this.status,
        createdAt = this.createdAt,
    )
}
