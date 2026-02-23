package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Execution

abstract class ExecutionEvent(
    val execution: Execution,
) : BusinessEvent<Execution>(execution) {
    /**
     * Event published when an execution is created
     *
     * @param execution the created execution
     */
    class Created(
        execution: Execution,
    ) : ExecutionEvent(execution)
}
