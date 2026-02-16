package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.api.adapter.dto.response.announcement.toResponseDTO
import com.forsetijudge.core.domain.entity.Announcement
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
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
