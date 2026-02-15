package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.api.adapter.dto.response.submission.toPublicResponseDTO
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.port.driven.WebSocketFanoutProducer
import com.forsetijudge.core.port.dto.output.LeaderboardOutputDTO
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.io.Serializable

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

    fun emitFreeze(contest: Contest) {
        logger.info("Emitting freeze event for contest: ${contest.id}")

        webSocketFanoutProducer.produce(
            "/topic/contests/${contest.id}/leaderboard/freeze",
            emptyMap<String, String>() as Serializable,
        )
    }

    fun emitUnfreeze(
        leaderboard: LeaderboardOutputDTO,
        frozenSubmissions: List<Submission>,
    ) {
        logger.info("Emitting unfreeze event for contest: ${leaderboard.contestId}")

        webSocketFanoutProducer.produce(
            "/topic/contests/${leaderboard.contestId}/leaderboard/unfreeze",
            mapOf(
                "leaderboard" to leaderboard,
                "frozenSubmissions" to frozenSubmissions.map { it.toPublicResponseDTO() },
            ) as Serializable,
        )
    }
}
