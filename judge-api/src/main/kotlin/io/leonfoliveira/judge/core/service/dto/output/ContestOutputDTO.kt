package io.leonfoliveira.judge.core.service.dto.output

import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.port.BucketAdapter
import java.time.LocalDateTime

data class ContestOutputDTO(
    val id: Int,
    val title: String,
    val languages: List<Language>,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
    val members: List<MemberOutputDTO>,
    val problems: List<ProblemOutputDTO>,
)

fun Contest.toOutputDTO(bucketAdapter: BucketAdapter): ContestOutputDTO {
    return ContestOutputDTO(
        id = this.id,
        title = this.title,
        languages = this.languages,
        startAt = this.startAt,
        endAt = this.endAt,
        members = this.members.map { it.toOutputDTO() },
        problems = this.problems.map { it.toOutputDTO(bucketAdapter) },
    )
}
