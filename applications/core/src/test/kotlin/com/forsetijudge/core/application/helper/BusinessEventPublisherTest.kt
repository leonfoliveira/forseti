package com.forsetijudge.core.application.helper

import com.forsetijudge.core.domain.event.ContestEvent
import java.util.UUID
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.springframework.context.ApplicationEventPublisher

class BusinessEventPublisherTest {
    val applicationEventPublisher = mock<ApplicationEventPublisher>()
    val businessEventPublisher = BusinessEventPublisher(applicationEventPublisher)

    @Test
    fun `should publish business events to application event publisher`() {
        val event = ContestEvent.Created(UUID.randomUUID())

        businessEventPublisher.publish(event)

        verify(applicationEventPublisher).publishEvent(event)
    }
}
