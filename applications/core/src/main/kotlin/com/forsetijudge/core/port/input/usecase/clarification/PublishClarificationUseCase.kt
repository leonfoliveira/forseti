package com.forsetijudge.core.port.input.usecase.clarification

import com.forsetijudge.core.port.dto.response.clarification.ClarificationResponseDTO
import java.util.UUID

interface PublishClarificationUseCase {
    /**
     * Publishes a clarification, making it visible to everyone.
     *
     * @param command The command containing the clarification ID to be published.
     * @return A ClarificationResponseDTO representing the published clarification.
     */
    fun execute(command: Command): ClarificationResponseDTO

    /**
     * Command class representing the input data required to publish a clarification.
     *
     * @property clarificationId The unique identifier of the clarification being published.
     */
    data class Command(
        val clarificationId: UUID,
    )
}
