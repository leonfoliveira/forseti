package io.leonfoliveira.judge.core.service.dto.input

import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.enumerate.Language
import jakarta.validation.Valid
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import java.time.LocalDateTime

data class CreateContestInputDTO(
    @field:NotBlank
    val title: String,
    @field:NotEmpty
    val languages: List<Language>,
    @field:Future
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
    @field:Valid
    val members: List<@Valid MemberDTO>,
    @field:Valid
    val problems: List<@Valid ProblemDTO>,
) {
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

    data class ProblemDTO(
        @field:NotEmpty
        val title: String,
        val description: AttachmentInputDTO,
        @field:Min(1)
        val timeLimit: Int,
        val testCases: AttachmentInputDTO,
    )
}
