package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Execution

abstract class ExecutionEvent : BusinessEvent() {
    /**
     * Event published when an execution is created
     *
     * @param execution the created execution
     */
    class Created(
        val execution: Execution,
    ) : ExecutionEvent()
}
