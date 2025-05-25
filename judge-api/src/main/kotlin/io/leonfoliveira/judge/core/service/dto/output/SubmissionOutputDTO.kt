package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.port.BucketAdapter
import java.time.LocalDateTime
import java.util.UUID

data class SubmissionOutputDTO(
    val id: Int,
    val problem: ProblemDTO,
    val member: MemberDTO,
    val language: Language,
    val status: Submission.Status,
    val codeKey: UUID,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
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

fun Submission.toOutputDTO(): SubmissionOutputDTO {
    return SubmissionOutputDTO(
        id = id,
        problem =
            SubmissionOutputDTO.ProblemDTO(
                id = problem.id,
                title = problem.title,
            ),
        member =
            SubmissionOutputDTO.MemberDTO(
                id = member.id,
                name = member.name,
            ),
        language = language,
        status = status,
        codeKey = code.key,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )
}
