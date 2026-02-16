package com.forsetijudge.api.adapter.driving.listener

import com.forsetijudge.api.adapter.driven.emitter.StompAnnouncementEmitter
import com.forsetijudge.core.domain.event.AnnouncementCreatedEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class AnnouncementEventsApiListener(
    private val announcementEmitter: StompAnnouncementEmitter,
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
