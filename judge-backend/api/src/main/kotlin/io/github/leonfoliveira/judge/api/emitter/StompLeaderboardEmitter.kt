package io.github.leonfoliveira.judge.api.emitter

import io.github.leonfoliveira.judge.common.service.dto.output.LeaderboardOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

@Component
class StompLeaderboardEmitter(
    private val messagingTemplate: SimpMessagingTemplate,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

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
