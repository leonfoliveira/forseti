package live.forseti.core.port.dto.input.contest

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.validation.Valid
import jakarta.validation.constraints.AssertFalse
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import live.forseti.core.domain.entity.Member
import live.forseti.core.domain.entity.Submission
import live.forseti.core.port.dto.input.attachment.AttachmentInputDTO
import java.time.OffsetDateTime
import java.util.UUID

data class UpdateContestInputDTO(
    val id: UUID,
    @field:NotBlank
    @field:Size(max = 32)
    @field:Pattern(regexp = "^[a-zA-Z0-9-]+$", message = "Slug can only contain letter, numbers, and hyphens")
    val slug: String,
    @field:NotBlank
    @field:Size(max = 255)
    val title: String,
    @field:NotEmpty
    val languages: List<Submission.Language>,
    val startAt: OffsetDateTime,
    @field:Future
    val endAt: OffsetDateTime,
    @field:Valid
    val settings: SettingsDTO,
    @field:Valid
    val members: List<MemberDTO>,
    @field:Valid
    val problems: List<ProblemDTO>,
) {
    @get:JsonIgnore
    @get:AssertTrue(message = "endAt must be after start date")
    val isEndAtAfterStartAt: Boolean
        get() = startAt.isBefore(endAt)

    data class SettingsDTO(
        val isAutoJudgeEnabled: Boolean,
    )

    data class MemberDTO(
        val id: UUID? = null,
        val type: Member.Type,
        @field:NotBlank
        @field:Size(max = 32)
        val name: String,
        @field:NotBlank
        @field:Size(max = 32)
        val login: String,
        @field:Size(max = 32)
        val password: String? = null,
    ) {
        @get:JsonIgnore
        @get:AssertFalse(message = "password is required when creating a member")
        val isIdAndPasswordNull: Boolean
            get() = id == null && password.isNullOrBlank()

        override fun toString(): String =
            "MemberDTO(id=$id, type=$type, name='$name', login='$login', " +
                "password=${if (password.isNullOrBlank()) "null" else "'******'"})"
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
        val id: UUID? = null,
        val letter: Char,
        @field:NotBlank
        @field:Size(max = 255)
        val title: String,
        val description: AttachmentInputDTO,
        @field:Min(1)
        val timeLimit: Int,
        @field:Min(1)
        val memoryLimit: Int,
        val testCases: AttachmentInputDTO,
    )
}
