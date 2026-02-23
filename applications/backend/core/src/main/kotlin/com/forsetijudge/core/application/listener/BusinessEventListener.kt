package com.forsetijudge.core.application.listener

import com.forsetijudge.core.domain.event.BusinessEvent
import org.springframework.stereotype.Component

@Component
interface BusinessEventListener<TBusinessEvent : BusinessEvent<*>> {
    /**
     * Handles the given business event.
     *
     * @param event The business event to handle.
     */
    fun onApplicationEvent(event: TBusinessEvent)
}
