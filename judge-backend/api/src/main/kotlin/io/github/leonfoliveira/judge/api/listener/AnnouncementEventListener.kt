package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompAnnouncementEmitter
import io.github.leonfoliveira.judge.common.event.AnnouncementEvent
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class AnnouncementEventListener(
    private val stompAnnouncementEmitter: StompAnnouncementEmitter,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @EventListener(AnnouncementEvent::class)
    fun onApplicationEvent(event: AnnouncementEvent) {
        logger.info("Handling announcement event: ${event.announcement}")
        stompAnnouncementEmitter.emit(event.announcement)
    }
}
