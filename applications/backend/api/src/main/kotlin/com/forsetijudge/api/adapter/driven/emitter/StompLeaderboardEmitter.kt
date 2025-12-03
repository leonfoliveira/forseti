package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.core.port.driven.WebSocketFanoutProducer
import com.forsetijudge.core.port.dto.output.LeaderboardOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class StompLeaderboardEmitter(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Emits a leaderboard to the appropriate STOMP topic.
     *
     * @param leaderboard The leaderboard to be emitted.
     */
    fun emit(leaderboard: LeaderboardOutputDTO) {
        logger.info(
            "Emitting leaderboard for contest: ${leaderboard.contestId}",
        )

        webSocketFanoutProducer.produce(
            "/topic/contests/${leaderboard.contestId}/leaderboard",
            leaderboard,
        )
    }
}
