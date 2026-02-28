package com.forsetijudge.core.port.driving.usecase.external.contest

import com.fasterxml.jackson.annotation.JsonIgnore
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import jakarta.validation.Valid
import jakarta.validation.constraints.AssertFalse
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.OffsetDateTime
import java.util.UUID

interface UpdateContestUseCase {
    /**
     * Updates an existing contest with the provided command data.
     *
     * @param command The command containing the data for updating the contest.
     * @return The updated contest entity.
     */
    fun execute(
        @Valid command: Command,
    ): Contest

    /**
     * Command for updating a contest, containing all necessary fields for the update operation.
     *
     * @param slug The unique slug for the contest, used in URLs and must be unique across all contests.
     * @param title The title of the contest, which must not be blank and has a maximum length of 255 characters.
     * @param languages The list of programming languages allowed in the
     * @param startAt The scheduled start time of the contest.
     * @param endAt The scheduled end time of the contest, which must be in the future and after the start time.
     * @param autoFreezeAt The optional time when the contest will automatically freeze, which must be before the end time if provided.
     * @param settings The settings for the contest, including whether auto-judging is enabled.
     * @param members The list of members participating in the contest, which must have unique logins and valid types.
     * @param problems The list of problems included in the contest, which must have unique letters and valid attributes such as time and memory limits.
     */
    data class Command(
        @field:NotBlank(message = "'slug' must not be blank")
        @field:Size(max = 30, message = "'slug' must be at most 30 characters long")
        @field:Pattern(regexp = "^[a-zA-Z0-9-]+$", message = "'slug' can only contain letters, numbers, and hyphens")
        val slug: String,
        @field:NotBlank(message = "'title' must not be blank")
        @field:Size(max = 200, message = "'title' must be at most 200 characters long")
        val title: String,
        @field:NotEmpty(message = "'languages' must not be empty")
        val languages: List<Submission.Language>,
        // Must be in the future if it is being updated (validated in the service layer)
        val startAt: OffsetDateTime,
        val endAt: OffsetDateTime,
        val autoFreezeAt: OffsetDateTime? = null,
        @field:Valid
        val settings: Settings,
        @field:Valid
        val members: List<Member>,
        @field:Valid
        val problems: List<Problem>,
    ) {
        @get:JsonIgnore
        @get:AssertTrue(message = "'endAt' must be after start date")
        val isEndAtAfterStartAt: Boolean
            get() = startAt.isBefore(endAt)

        @get:JsonIgnore
        @get:AssertTrue(message = "'autoFreezeAt' must be between 'startAt' and 'endAt'")
        val isAutoFreezeAtBetweenStartAtAndEndAt: Boolean
            get() = autoFreezeAt == null || !autoFreezeAt.isBefore(startAt) || !autoFreezeAt.isAfter(endAt)

        data class Settings(
            val isAutoJudgeEnabled: Boolean,
            val isClarificationEnabled: Boolean,
            val isSubmissionPrintTicketEnabled: Boolean,
            val isTechnicalSupportTicketEnabled: Boolean,
            val isNonTechnicalSupportTicketEnabled: Boolean,
            val isGuestEnabled: Boolean,
        )

        data class Member(
            val id: UUID? = null,
            val type: Member.Type,
            @field:NotBlank(message = "'members.name' must not be blank")
            @field:Size(max = 50, message = "'members.name' must be at most 50 characters long")
            val name: String,
            @field:NotBlank(message = "'members.login' must not be blank")
            @field:Size(max = 30, message = "'members.login' must be at most 30 characters long")
            @field:Pattern(
                regexp = "^[a-zA-Z0-9_-]+$",
                message = "'members.login' can only contain letters, numbers, underscores, and hyphens",
            )
            val login: String,
            @field:Size(max = 30, message = "'members.password' must be at most 30 characters long")
            val password: String? = null,
        ) {
            @get:JsonIgnore
            @get:AssertFalse(message = "'members.password' is required when creating a member")
            val isIdAndPasswordNull: Boolean
                get() = id == null && password.isNullOrBlank()
        }

        @get:JsonIgnore
        @get:AssertFalse(message = "'members.login' must be unique")
        val isLoginDuplicated: Boolean
            get() = members.groupBy { it.login }.any { it.value.size > 1 }

        data class Problem(
            val id: UUID? = null,
            val letter: Char,
            @field:Pattern("^#[A-Fa-f0-9]{6}$", message = "'problems.color' must be a valid hexadecimal color code")
            val color: String,
            @field:NotBlank(message = "'problems.title' must not be blank")
            @field:Size(max = 200, message = "'problems.title' must be at most 200 characters long")
            val title: String,
            @field:Valid
            val description: AttachmentCommandDTO,
            @field:Min(1, message = "'problems.timeLimit' must be positive")
            val timeLimit: Int,
            @field:Min(1, message = "'problems.memoryLimit' must be positive")
            val memoryLimit: Int,
            @field:Valid
            val testCases: AttachmentCommandDTO,
        )

        @get:JsonIgnore
        @get:AssertFalse(message = "'problems.letter' must be unique")
        val isProblemLetterDuplicated: Boolean
            get() = problems.groupBy { it.letter }.any { it.value.size > 1 }
    }
}
