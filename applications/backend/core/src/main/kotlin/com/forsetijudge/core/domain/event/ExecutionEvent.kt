package com.forsetijudge.core.domain.event

import java.util.UUID

interface ExecutionEvent : BusinessEvent {
    /**
     * Event published when an execution is created
     *
     * @param executionId the created execution
     */
    class Created(
        val executionId: UUID,
    ) : ExecutionEvent
}
