package com.forsetijudge.core.port.driving.usecase.external.announcement

import com.forsetijudge.core.domain.entity.Announcement
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

interface CreateAnnouncementUseCase {
    /**
     * Creates a new announcement for a contest.
     *
     * @param command The command object containing the details of the announcement to be created.
     * @return The created announcement entity.
     */
    fun execute(
        @Valid command: Command,
    ): Announcement

    /**
     * Command object for creating an announcement.
     *
     * @param text The text of the announcement. Must not be blank and must be at most 255 characters long.
     */
    data class Command(
        @field:NotBlank(message = "'text' must not be blank")
        @field:Size(max = 500, message = "'text' must be at most 500 characters long")
        val text: String,
    )
}
