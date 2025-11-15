package io.github.leonfoliveira.forseti.api.adapter.driven.emitter

import io.github.leonfoliveira.forseti.api.adapter.dto.response.announcement.toResponseDTO
import io.github.leonfoliveira.forseti.api.application.port.driven.AnnouncementEmitter
import io.github.leonfoliveira.forseti.common.application.domain.entity.Announcement
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class StompAnnouncementEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
) : AnnouncementEmitter {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Emits an announcement to the appropriate STOMP topic.
     *
     * @param announcement The announcement to be emitted.
     */
    override fun emit(announcement: Announcement) {
        logger.info(
            "Emitting announcement with id: ${announcement.id} for contest with id: ${announcement.contest.id}",
        )

        val contest = announcement.contest
        messagingTemplate.convertAndSend(
            "/topic/contests/${contest.id}/announcements",
            announcement.toResponseDTO(),
        )
    }
}
