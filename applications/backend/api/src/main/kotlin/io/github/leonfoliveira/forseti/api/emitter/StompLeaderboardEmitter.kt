package io.github.leonfoliveira.forseti.api.emitter

import io.github.leonfoliveira.forseti.common.service.dto.output.LeaderboardOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class StompLeaderboardEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
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

        messagingTemplate.convertAndSend(
            "/topic/contests/${leaderboard.contestId}/leaderboard",
            leaderboard,
        )
    }
}
