package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.entity.Member
import io.leonfoliveira.judge.core.entity.enumerate.Language
import io.leonfoliveira.judge.core.entity.model.RawAttachment
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
