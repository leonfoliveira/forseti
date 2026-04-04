package com.forsetijudge.core.port.driving.usecase.internal.outbox

import com.forsetijudge.core.domain.event.BusinessEvent

interface PublishOutboxEventInternalUseCase {
    /**
     * Executes the command to publish a business event contained in the Command object.
     *
     * @param command The command containing the business event to be published.
     */
    fun execute(command: Command)

    /**
     * Command for the PublishOutboxEventInternalUseCase containing the business event to be published.
     *
     * @param event The business event to be published.
     */
    data class Command(
        val event: BusinessEvent,
    )
}
