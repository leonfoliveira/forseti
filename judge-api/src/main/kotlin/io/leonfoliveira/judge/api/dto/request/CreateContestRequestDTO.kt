package io.leonfoliveira.judge.api.dto.request

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.RawAttachment
import io.leonfoliveira.judge.core.service.dto.input.CreateContestInputDTO
import java.time.LocalDateTime
import java.util.Base64

data class CreateContestRequestDTO(
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
    ) {
        fun toInputDTO(): CreateContestInputDTO.MemberDTO {
            return CreateContestInputDTO.MemberDTO(
                type = type,
                name = name,
                login = login,
                password = password,
            )
        }
    }

    data class ProblemDTO(
        val title: String,
        val description: String,
        val timeLimit: Int,
        val testCases: AttachmentRequestDTO,
    ) {
        fun toInputDTO(): CreateContestInputDTO.ProblemDTO {
            return CreateContestInputDTO.ProblemDTO(
                title = title,
                description = description,
                timeLimit = timeLimit,
                testCases =
                    RawAttachment(
                        filename = testCases.filename,
                        content = Base64.getDecoder().decode(testCases.content),
                    ),
            )
        }
    }

    fun toInputDTO(): CreateContestInputDTO {
        return CreateContestInputDTO(
            title = title,
            languages = languages,
            startAt = startAt,
            endAt = endAt,
            members = members.map { it.toInputDTO() },
            problems = problems.map { it.toInputDTO() },
        )
    }
}
