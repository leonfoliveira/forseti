package com.forsetijudge.core.port.driving.usecase.external.clarification

import java.util.UUID

interface DeleteClarificationUseCase {
    /**
     * Deletes a clarification with the specified ID.
     *
     * @param command The command containing the ID of the clarification to delete.
     */
    fun execute(command: Command)

    /**
     * Command for deleting a clarification.
     *
     * @param clarificationId The ID of the clarification to delete.
     */
    data class Command(
        val clarificationId: UUID,
    )
}
