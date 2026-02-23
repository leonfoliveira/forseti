package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import org.slf4j.LoggerFactory
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

class LeaderboardFrozenEventListener(
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) : BusinessEventListener<LeaderboardEvent.Frozen> {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(LeaderboardEvent.Frozen::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: LeaderboardEvent.Frozen) {
        logger.info("Emitting leaderboard frozen for contest with id: {}", event.contest.id)

        val contest = event.contest
        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${contest.id}/leaderboard:frozen",
            ),
        )
    }
}
