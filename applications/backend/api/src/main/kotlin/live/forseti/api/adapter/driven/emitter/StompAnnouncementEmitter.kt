package live.forseti.api.adapter.driven.emitter

import live.forseti.api.adapter.dto.response.announcement.toResponseDTO
import live.forseti.core.domain.entity.Announcement
import live.forseti.core.port.driven.WebSocketFanoutProducer
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class StompAnnouncementEmitter(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
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
        webSocketFanoutProducer.produce(
            "/topic/contests/${contest.id}/announcements",
            announcement.toResponseDTO(),
        )
    }
}
