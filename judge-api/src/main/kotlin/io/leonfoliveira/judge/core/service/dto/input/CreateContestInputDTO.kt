package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.RawAttachment
import java.time.LocalDateTime

data class CreateContestInputDTO(
    val title: String,
    val languages: List<Language>,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
    val members: List<MemberDTO>,
    val problems: List<ProblemDTO>,
) {
    data class MemberDTO(
        val type: Member.Type,
        val name: String,
        val login: String,
        val password: String,
    )

    data class ProblemDTO(
        val title: String,
        val description: String,
        val timeLimit: Int,
        val testCases: RawAttachment,
    )
}
