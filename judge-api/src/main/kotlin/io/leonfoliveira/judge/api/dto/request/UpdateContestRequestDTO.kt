package io.leonfoliveira.judge.api.dto.request

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.domain.model.RawAttachment
import io.leonfoliveira.judge.core.service.dto.input.UpdateContestInputDTO
import java.time.LocalDateTime
import java.util.Base64

data class UpdateContestRequestDTO(
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
        fun toInputDTO(): UpdateContestInputDTO.MemberDTO {
            return UpdateContestInputDTO.MemberDTO(
                type = type,
                name = name,
                login = login,
                password = password,
            )
        }
    }

    data class ProblemDTO(
        val id: Int? = null,
        val title: String,
        val description: String,
        val timeLimit: Int,
        val testCases: AttachmentRequestDTO? = null,
    ) {
        fun toCreateDTO(): UpdateContestInputDTO.ProblemDTO {
            return UpdateContestInputDTO.ProblemDTO(
                title = title,
                description = description,
                timeLimit = timeLimit,
                testCases =
                    testCases?.let {
                        RawAttachment(
                            filename = it.filename,
                            content = Base64.getDecoder().decode(it.content),
                        )
                    },
            )
        }
    }

    fun toInputDTO(): UpdateContestInputDTO {
        return UpdateContestInputDTO(
            id = id,
            title = title,
            languages = languages,
            startAt = startAt,
            endAt = endAt,
            members = members.map { it.toInputDTO() },
            problems = problems.map { it.toCreateDTO() },
        )
    }
}
