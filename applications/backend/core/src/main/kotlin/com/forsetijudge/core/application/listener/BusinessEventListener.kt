package com.forsetijudge.core.application.listener

import com.forsetijudge.core.domain.event.BusinessEvent
import org.slf4j.LoggerFactory

abstract class BusinessEventListener<TPayload, TBusinessEvent : BusinessEvent<TPayload>> : ApplicationEventListener() {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Handles the given business event.
     *
     * @param event The business event to handle.
     */
    open fun onApplicationEvent(event: TBusinessEvent) {
        super.onApplicationEvent(event)

        logger.info("Handling business event of type: ${event::class.java.simpleName}")

        handlePayload(event.payload)

        logger.info("Finished handling business event of type: ${event::class.java.simpleName}")
    }

    abstract fun handlePayload(payload: TPayload)
}
