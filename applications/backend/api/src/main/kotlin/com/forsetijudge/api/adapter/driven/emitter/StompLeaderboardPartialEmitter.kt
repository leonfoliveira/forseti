package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.dto.output.LeaderboardPartialOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class StompLeaderboardPartialEmitter(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Emits a partial leaderboard to the appropriate STOMP topic.
     *
     * @param partialLeaderboard The partial leaderboard to be emitted.
     */
    fun emit(
        contest: Contest,
        partialLeaderboard: LeaderboardPartialOutputDTO,
    ) {
        logger.info(
            "Emitting partial leaderboard for contest with id: ${contest.id}",
        )

        webSocketFanoutProducer.produce(
            "/topic/contests/${contest.id}/leaderboard/partial",
            partialLeaderboard,
        )
    }
}
