package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import jakarta.validation.Valid
import jakarta.validation.constraints.AssertFalse
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import java.time.LocalDateTime

data class UpdateContestInputDTO(
    val id: Int,
    @field:NotBlank
    val title: String,
    @field:NotEmpty
    val languages: List<Language>,
    @field:Future
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
    @field:Valid
    val members: List<MemberDTO>,
    @field:Valid
    val problems: List<ProblemDTO>,
) {
    @get:AssertTrue(message = "endAt must be after start date")
    val isEndAtAfterStartAt: Boolean
        get() = startAt.isBefore(endAt)

    data class MemberDTO(
        val id: Int? = null,
        val type: Member.Type,
        @field:NotBlank
        val name: String,
        @field:NotBlank
        val login: String,
        val password: String? = null,
    ) {
        @get:AssertFalse(message = "password is required when creating a member")
        val isIdAndPasswordNull: Boolean
            get() = id == null && password.isNullOrBlank()

        fun toCreateDTO(): CreateContestInputDTO.MemberDTO {
            return CreateContestInputDTO.MemberDTO(
                type = type,
                name = name,
                login = login,
                password = password!!,
            )
        }

        override fun toString(): String {
            return "MemberDTO(id=$id, type=$type, name='$name', login='$login', " +
                "password=${if (password.isNullOrBlank()) "null" else "'******'"})"
        }
    }

    data class ProblemDTO(
        val id: Int? = null,
        @field:NotEmpty
        val title: String,
        val description: AttachmentInputDTO,
        @field:Min(1)
        val timeLimit: Int,
        val testCases: AttachmentInputDTO,
    ) {
        fun toCreateDTO(): CreateContestInputDTO.ProblemDTO {
            return CreateContestInputDTO.ProblemDTO(
                title = title,
                description = description,
                timeLimit = timeLimit,
                testCases = testCases,
            )
        }
    }
}
