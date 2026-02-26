package com.forsetijudge.core.port.driving.usecase.external.contest

import com.fasterxml.jackson.annotation.JsonIgnore
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Submission
import jakarta.validation.Valid
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.OffsetDateTime

interface CreateContestUseCase {
    /**
     * Creates a new contest with the provided command data.
     *
     * @param command The command containing the data for creating the contest.
     * @return The created contest entity.
     */
    fun execute(
        @Valid command: Command,
    ): Contest

    /**
     * Command for creating a new contest.
     *
     * @param slug The unique slug for the contest, which can only contain letters, numbers, and hyphens.
     * @param title The title of the contest.
     * @param languages The list of programming languages allowed in the contest.
     * @param startAt The start time of the contest, which must be in the future.
     * @param endAt The end time of the contest, which must be after the start time.
     */
    data class Command(
        @field:NotBlank(message = "'slug' must not be blank")
        @field:Size(max = 30, message = "'slug' must be at most 30 characters long")
        @field:Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "'slug' can only contain letters, numbers, underscores and hyphens")
        val slug: String,
        @field:NotBlank(message = "'title' must not be blank")
        @field:Size(max = 200, message = "'title' must be at most 200 characters long")
        val title: String,
        @field:NotEmpty(message = "'languages' must not be empty")
        val languages: List<Submission.Language>,
        @field:Future(message = "'startAt' must be in the future")
        val startAt: OffsetDateTime,
        val endAt: OffsetDateTime,
    ) {
        @get:JsonIgnore
        @get:AssertTrue(message = "'endAt' must be after 'startAt'")
        val isEndAtAfterStartAt: Boolean
            get() = startAt.isBefore(endAt)
    }
}
