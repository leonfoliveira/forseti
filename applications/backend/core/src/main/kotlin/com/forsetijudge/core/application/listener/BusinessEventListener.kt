package com.forsetijudge.core.application.listener

import com.forsetijudge.core.domain.event.BusinessEvent

interface BusinessEventListener<TBusinessEvent : BusinessEvent> {
    /**
     * Handles the given business event.
     *
     * @param event The business event to handle.
     */
    fun handle(event: TBusinessEvent)
}
