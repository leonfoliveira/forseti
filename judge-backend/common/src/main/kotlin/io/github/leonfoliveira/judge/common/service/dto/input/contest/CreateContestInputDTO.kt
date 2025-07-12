package io.github.leonfoliveira.judge.common.service.dto.input.contest

import com.fasterxml.jackson.annotation.JsonIgnore
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.service.dto.input.attachment.AttachmentInputDTO
import jakarta.validation.Valid
import jakarta.validation.constraints.AssertFalse
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Pattern
import java.time.OffsetDateTime

data class CreateContestInputDTO(
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
    val members: List<@Valid MemberDTO>,
    @field:Valid
    val problems: List<@Valid ProblemDTO>,
) {
    @get:JsonIgnore
    @get:AssertTrue(message = "endAt must be after start date")
    val isEndAtAfterStartAt: Boolean
        get() = startAt.isBefore(endAt)

    data class MemberDTO(
        val type: Member.Type,
        @field:NotBlank
        val name: String,
        @field:NotBlank
        val login: String,
        @field:NotBlank
        val password: String,
    ) {
        override fun toString(): String {
            return "MemberDTO(type=$type, name='$name', login='$login', password='******')"
        }
    }

    @get:JsonIgnore
    @get:AssertFalse(message = "login must be unique")
    val isLoginDuplicated: Boolean
        get() = members.groupBy { it.login }.any { it.value.size > 1 }

    @get:JsonIgnore
    @get:AssertFalse(message = "slug must be unique")
    val isProblemLetterDuplicated: Boolean
        get() = problems.groupBy { it.letter }.any { it.value.size > 1 }

    data class ProblemDTO(
        val letter: Char,
        @field:NotEmpty
        val title: String,
        val description: AttachmentInputDTO,
        @field:Min(1)
        val timeLimit: Int,
        @field:Min(1)
        val memoryLimit: Int,
        val testCases: AttachmentInputDTO,
    )
}
