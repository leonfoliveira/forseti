package io.leonfoliveira.judge.api.emitter.dto.emmit

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.domain.enumerate.Language
import java.time.LocalDateTime

data class SubmissionEmmitDTO(
    val id: Int,
    val memberId: Int,
    val problemId: Int,
    val language: Language,
    val status: Submission.Status,
    val createdAt: LocalDateTime,
)

fun Submission.toEmmitDTO() = SubmissionEmmitDTO(
    id = id,
    memberId = member.id,
    problemId = problem.id,
    language = language,
    status = status,
    createdAt = createdAt,
)