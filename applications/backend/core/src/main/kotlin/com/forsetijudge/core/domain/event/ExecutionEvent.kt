package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Execution
import java.util.UUID

abstract class ExecutionEvent : BusinessEvent() {
    /**
     * Event published when an execution is created
     *
     * @param execution the created execution
     */
    class Created(
        val executionId: UUID,
    ) : ExecutionEvent()
}
