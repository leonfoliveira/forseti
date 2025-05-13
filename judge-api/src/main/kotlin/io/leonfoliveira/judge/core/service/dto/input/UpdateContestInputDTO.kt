package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.RawAttachment
import java.time.LocalDateTime

data class UpdateContestInputDTO(
    val id: Int,
    val title: String,
    val languages: List<Language>,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
    val members: List<MemberDTO>,
    val problems: List<ProblemDTO>,
) {
    data class MemberDTO(
        val id: Int? = null,
        val type: Member.Type,
        val name: String,
        val login: String,
        val password: String? = null,
    ) {
        fun toCreateDTO(): CreateContestInputDTO.MemberDTO {
            return CreateContestInputDTO.MemberDTO(
                type = type,
                name = name,
                login = login,
                password = password!!,
            )
        }
    }

    data class ProblemDTO(
        val id: Int? = null,
        val title: String,
        val description: String,
        val timeLimit: Int,
        val testCases: RawAttachment? = null,
    ) {
        fun toCreateDTO(): CreateContestInputDTO.ProblemDTO {
            return CreateContestInputDTO.ProblemDTO(
                title = title,
                description = description,
                timeLimit = timeLimit,
                testCases = testCases!!,
            )
        }
    }
}
