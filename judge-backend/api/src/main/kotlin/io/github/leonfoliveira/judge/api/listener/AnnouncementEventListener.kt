package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompAnnouncementEmitter
import io.github.leonfoliveira.judge.common.event.AnnouncementCreatedEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class AnnouncementEventListener(
    private val stompAnnouncementEmitter: StompAnnouncementEmitter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(AnnouncementCreatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: AnnouncementCreatedEvent) {
        logger.info("Handling announcement event: ${event.announcement}")
        stompAnnouncementEmitter.emit(event.announcement)
    }
}
