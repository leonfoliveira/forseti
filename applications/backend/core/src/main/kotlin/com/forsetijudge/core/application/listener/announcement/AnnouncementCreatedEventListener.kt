package com.forsetijudge.core.application.listener.announcement

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import org.slf4j.LoggerFactory
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

class AnnouncementCreatedEventListener(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) : BusinessEventListener<AnnouncementEvent.Created> {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(AnnouncementEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: AnnouncementEvent.Created) {
        logger.info("Handling announcement created event with id: {}", event.payload.id)

        val announcement = event.payload
        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${announcement.id}/announcements",
                announcement.toResponseBodyDTO(),
            ),
        )
    }
}
