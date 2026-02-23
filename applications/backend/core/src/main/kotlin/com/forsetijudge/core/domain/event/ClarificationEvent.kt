package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Clarification

abstract class ClarificationEvent(
    clarification: Clarification,
) : BusinessEvent<Clarification>(clarification) {
    /**
     * Event published when a clarification is created
     *
     * @param clarification the created clarification
     */
    class Created(
        clarification: Clarification,
    ) : ClarificationEvent(clarification)

    /**
     * Event published when a clarification is deleted
     *
     * @param clarification the deleted clarification
     */
    class Deleted(
        clarification: Clarification,
    ) : ClarificationEvent(clarification)
}
