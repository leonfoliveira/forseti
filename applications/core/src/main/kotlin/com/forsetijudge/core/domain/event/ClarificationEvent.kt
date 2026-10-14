package com.forsetijudge.core.domain.event

import java.util.UUID

interface ClarificationEvent : BusinessEvent {
    /**
     * Event triggered when a clarification is created.
     */
    data class Created(
        val clarificationId: UUID,
    ) : ClarificationEvent

    /**
     * Event triggered when a clarification is answered.
     */
    data class Answered(
        val clarificationId: UUID,
    ) : ClarificationEvent

    /**
     * Event triggered when a clarification is published.
     */
    data class Published(
        val clarificationId: UUID,
    ) : ClarificationEvent
}
