package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompAnnouncementEmitter
import io.github.leonfoliveira.judge.common.event.AnnouncementEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class AnnouncementEventListener(
    private val stompAnnouncementEmitter: StompAnnouncementEmitter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(AnnouncementEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: AnnouncementEvent) {
        logger.info("Handling announcement event: ${event.announcement}")
        stompAnnouncementEmitter.emit(event.announcement)
    }
}
