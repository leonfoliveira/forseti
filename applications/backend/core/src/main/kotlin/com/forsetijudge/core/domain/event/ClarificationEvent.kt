package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Clarification

abstract class ClarificationEvent : BusinessEvent() {
    /**
     * Event published when a clarification is created
     *
     * @param clarification the created clarification
     */
    class Created(
        val clarification: Clarification,
    ) : ClarificationEvent()

    /**
     * Event published when a clarification is deleted
     *
     * @param clarification the deleted clarification
     */
    class Deleted(
        val clarification: Clarification,
    ) : ClarificationEvent()
}
