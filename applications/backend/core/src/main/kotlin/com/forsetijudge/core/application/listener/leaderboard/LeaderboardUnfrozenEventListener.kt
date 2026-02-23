package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.submission.FindAllSubmissionsByContestSinceLastFreezeUseCase
import com.forsetijudge.core.port.dto.response.leaderboard.toUnfreezeResponseBodyDTO
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

class LeaderboardUnfrozenEventListener(
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
    private val findAllSubmissionsByContestSinceLastFreezeUseCase: FindAllSubmissionsByContestSinceLastFreezeUseCase,
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
) : BusinessEventListener<Contest, LeaderboardEvent.Unfrozen>() {
    @TransactionalEventListener(LeaderboardEvent.Unfrozen::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: LeaderboardEvent.Unfrozen) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Contest) {
        val leaderboard = buildLeaderboardUseCase.execute()
        val frozenSubmissions =
            findAllSubmissionsByContestSinceLastFreezeUseCase.execute()
        webSocketFanoutProducer.produce(
            WebSocketFanoutPayload(
                "/topic/contests/${leaderboard.contestId}/leaderboard:unfrozen",
                leaderboard.toUnfreezeResponseBodyDTO(frozenSubmissions),
            ),
        )
    }
}
