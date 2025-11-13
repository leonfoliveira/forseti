package io.github.leonfoliveira.forseti.api.emitter

import io.github.leonfoliveira.forseti.api.dto.response.announcement.toResponseDTO
import io.github.leonfoliveira.forseti.common.domain.entity.Announcement
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class StompAnnouncementEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Emits an announcement to the appropriate STOMP topic.
     *
     * @param announcement The announcement to be emitted.
     */
    fun emit(announcement: Announcement) {
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
