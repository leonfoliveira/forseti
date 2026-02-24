package com.forsetijudge.core.application.listener.announcement

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.domain.event.AnnouncementEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.dto.response.announcement.toResponseBodyDTO
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class AnnouncementCreatedEventListener(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) : BusinessEventListener<Announcement, AnnouncementEvent.Created>() {
    @TransactionalEventListener(AnnouncementEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: AnnouncementEvent.Created) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Announcement) {
        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${payload.id}/announcements",
                payload.toResponseBodyDTO(),
            ),
        )
    }
}
