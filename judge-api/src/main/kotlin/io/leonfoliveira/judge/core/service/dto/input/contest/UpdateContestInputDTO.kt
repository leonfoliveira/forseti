package io.leonfoliveira.judge.core.service.dto.input.contest

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import io.leonfoliveira.judge.core.service.dto.input.attachment.AttachmentInputDTO
import jakarta.validation.Valid
import jakarta.validation.constraints.AssertFalse
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Pattern
import java.time.OffsetDateTime
import java.util.UUID

data class UpdateContestInputDTO(
    val id: UUID,
    @field:Pattern(regexp = "^[a-zA-Z0-9-]+$", message = "Slug can only contain letter, numbers, and hyphens")
    val slug: String,
    @field:NotBlank
    val title: String,
    @field:NotEmpty
    val languages: List<Language>,
    @field:Future
    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,
    @field:Valid
    val members: List<MemberDTO>,
    @field:Valid
    val problems: List<ProblemDTO>,
) {
    @get:AssertTrue(message = "endAt must be after start date")
    val isEndAtAfterStartAt: Boolean
        get() = startAt.isBefore(endAt)

    data class MemberDTO(
        val id: UUID? = null,
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

    @get:AssertFalse(message = "login must be unique")
    val isLoginDuplicated: Boolean
        get() = members.groupBy { it.login }.any { it.value.size > 1 }

    @get:AssertFalse(message = "slug must be unique")
    val isProblemLetterDuplicated: Boolean
        get() = problems.groupBy { it.letter }.any { it.value.size > 1 }

    data class ProblemDTO(
        val id: UUID? = null,
        val letter: Char,
        @field:NotEmpty
        val title: String,
        val description: AttachmentInputDTO,
        @field:Min(1)
        val timeLimit: Int,
        @field:Min(1)
        val memoryLimit: Int,
        val testCases: AttachmentInputDTO,
    ) {
        fun toCreateDTO(): CreateContestInputDTO.ProblemDTO {
            return CreateContestInputDTO.ProblemDTO(
                letter = letter,
                title = title,
                description = description,
                timeLimit = timeLimit,
                memoryLimit = memoryLimit,
                testCases = testCases,
            )
        }
    }
}
