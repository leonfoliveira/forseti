package com.forsetijudge.core.domain.event

import java.util.UUID

interface PrintRequestEvent : BusinessEvent {
    /**
     * Event triggered when a print request is created.
     */
    data class Created(
        val printRequestId: UUID,
    ) : PrintRequestEvent

    /**
     * Event triggered when a print request is updated.
     */
    data class Updated(
        val printRequestId: UUID,
    ) : PrintRequestEvent
}
