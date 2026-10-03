package com.forsetijudge.core.application.helper

import com.forsetijudge.core.domain.event.ContestEvent
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.context.ApplicationEventPublisher
import java.util.UUID

class BusinessEventPublisherTest {
    @Test
    fun `publishes business events to Spring event publisher`() {
        val eventPublisher = mock<ApplicationEventPublisher>()
        val event = ContestEvent.Created(UUID.randomUUID())

        BusinessEventPublisher(eventPublisher).publish(event)

        verify(eventPublisher).publishEvent(event)
    }
}
