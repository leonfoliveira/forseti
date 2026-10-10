package com.forsetijudge.core.port.input.usecase.announcement

import com.forsetijudge.core.port.dto.response.announcement.AnnouncementResponseBodyDTO
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.UUID

interface CreateAnnouncementUseCase {
    /**
     * Creates a new announcement for a contest.
     *
     * @param command The command containing the contest ID and announcement text.
     * @return The created announcement.
     */
    fun execute(
        @Valid command: Command,
    ): AnnouncementResponseBodyDTO

    /**
     * Command object for creating a new announcement.
     *
     * @property contestId The ID of the contest for which the announcement is being created.
     * @property text The text of the announcement.
     */
    data class Command(
        val contestId: UUID,
        @field:NotBlank(message = "'text' must not be blank")
        @field:Size(max = 500, message = "'text' must be at most 500 characters long")
        val text: String,
    )
}
