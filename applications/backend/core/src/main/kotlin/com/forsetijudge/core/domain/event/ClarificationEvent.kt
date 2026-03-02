package com.forsetijudge.core.domain.event

import java.util.UUID

abstract class ClarificationEvent : BusinessEvent() {
    /**
     * Event published when a clarification is created
     *
     * @param clarification the created clarification
     */
    class Created(
        val clarificationId: UUID,
    ) : ClarificationEvent()

    /**
     * Event published when a clarification is deleted
     *
     * @param clarification the deleted clarification
     */
    class Deleted(
        val contestId: UUID,
        val clarificationId: UUID,
    ) : ClarificationEvent()
}
