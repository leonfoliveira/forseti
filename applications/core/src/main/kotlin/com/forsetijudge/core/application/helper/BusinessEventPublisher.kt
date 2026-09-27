package com.forsetijudge.core.application.helper

import com.forsetijudge.core.domain.event.BusinessEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component

@Component
class BusinessEventPublisher(
    val applicationEventPublisher: ApplicationEventPublisher,
) {
    /**
     * Publishes a business event to the application event publisher.
     *
     * @param event The business event to be published.
     */
    fun publish(event: BusinessEvent) {
        applicationEventPublisher.publishEvent(event)
    }
}
