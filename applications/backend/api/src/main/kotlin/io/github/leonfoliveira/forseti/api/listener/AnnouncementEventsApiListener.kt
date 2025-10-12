package io.github.leonfoliveira.forseti.api.listener

import io.github.leonfoliveira.forseti.api.emitter.StompAnnouncementEmitter
import io.github.leonfoliveira.forseti.common.event.AnnouncementCreatedEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class AnnouncementEventsApiListener(
    private val stompAnnouncementEmitter: StompAnnouncementEmitter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(AnnouncementCreatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: AnnouncementCreatedEvent) {
        logger.info("Handling announcement event: ${event.announcement}")
        stompAnnouncementEmitter.emit(event.announcement)
    }
}
