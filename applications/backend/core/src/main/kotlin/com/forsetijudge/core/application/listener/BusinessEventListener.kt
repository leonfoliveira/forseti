package com.forsetijudge.core.application.listener

import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.event.BusinessEvent

abstract class BusinessEventListener<TBusinessEvent : BusinessEvent> : ApplicationEventListener() {
    private val logger = SafeLogger(this::class)

    /**
     * Handles the given business event.
     *
     * @param event The business event to handle.
     */
    open fun onApplicationEvent(event: TBusinessEvent) {
        super.onApplicationEvent(event)

        logger.info("Handling business event of type: ${event::class.java.simpleName}")

        handleEvent(event)

        logger.info("Finished handling business event of type: ${event::class.java.simpleName}")
    }

    abstract fun handleEvent(event: TBusinessEvent)
}
