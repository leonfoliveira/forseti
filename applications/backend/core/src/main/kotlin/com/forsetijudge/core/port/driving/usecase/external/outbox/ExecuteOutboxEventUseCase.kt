package com.forsetijudge.core.port.driving.usecase.external.outbox

import java.util.UUID

interface ExecuteOutboxEventUseCase {
    /**
     * Executes the outbox event with the given id.
     *
     * @param command The command containing the id of the outbox event to be executed.
     */
    fun execute(command: Command)

    /**
     * Command class for executing an outbox event, containing the id of the outbox event to be executed.
     *
     * @property id The id of the outbox event to be executed.
     */
    data class Command(
        val id: UUID,
    )
}
