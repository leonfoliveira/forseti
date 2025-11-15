package io.github.leonfoliveira.forseti.api.application.listener

import io.github.leonfoliveira.forseti.api.application.port.driven.AnnouncementEmitter
import io.github.leonfoliveira.forseti.common.application.domain.event.AnnouncementCreatedEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class AnnouncementEventsApiListener(
    private val announcementEmitter: AnnouncementEmitter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Handles the AnnouncementCreatedEvent after the transaction is committed.
     *
     * @param event The AnnouncementCreatedEvent containing the announcement details.
     */
    @TransactionalEventListener(AnnouncementCreatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: AnnouncementCreatedEvent) {
        logger.info("Handling announcement event: ${event.announcement}")
        announcementEmitter.emit(event.announcement)
    }
}
