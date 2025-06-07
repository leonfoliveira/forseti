package io.leonfoliveira.judge.api.emitter.dto.emmit

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime

data class SubmissionPrivateEmmitDTO(
    val id: Int,
    val problem: ProblemDTO,
    val member: MemberDTO,
    val language: Language,
    val status: Submission.Status,
    val code: AttachmentEmmitDTO,
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

fun Submission.toPrivateEmmitDTO(): SubmissionPrivateEmmitDTO {
    return SubmissionPrivateEmmitDTO(
        id = this.id,
        problem =
            SubmissionPrivateEmmitDTO.ProblemDTO(
                id = this.problem.id,
                title = this.problem.title,
            ),
        member =
            SubmissionPrivateEmmitDTO.MemberDTO(
                id = this.member.id,
                name = this.member.name,
            ),
        language = this.language,
        status = this.status,
        createdAt = this.createdAt,
        code = this.code.toEmmitDTO(),
    )
}
