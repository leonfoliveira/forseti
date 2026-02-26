package com.forsetijudge.core.port.driving.usecase.external.member

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.UUID

interface UpdateMemberPasswordUseCase {
    /**
     * Updates the member's password.
     *
     * @param command The command containing the new password for the member.
     */
    fun execute(
        @Valid command: Command,
    )

    /**
     * Command object for updating the root user's password.
     *
     * @param memberId The ID of the member to update the password for.
     * @param password The new password for the member.
     */
    data class Command(
        val memberId: UUID,
        @field:NotBlank(message = "'password' must not be blank")
        @field:Size(max = 30, message = "'password' must be at most 30 characters long")
        val password: String,
    )
}
