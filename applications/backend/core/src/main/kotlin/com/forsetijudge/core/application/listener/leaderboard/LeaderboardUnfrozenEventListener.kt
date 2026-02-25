package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.submission.FindAllSubmissionsByContestSinceLastFreezeUseCase
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseBodyDTO
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener
import java.io.Serializable

@Component
class LeaderboardUnfrozenEventListener(
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
    private val findAllSubmissionsByContestSinceLastFreezeUseCase: FindAllSubmissionsByContestSinceLastFreezeUseCase,
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<Contest, LeaderboardEvent.Unfrozen>() {
    @TransactionalEventListener(LeaderboardEvent.Unfrozen::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: LeaderboardEvent.Unfrozen) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Contest) {
        val contest = payload
        val leaderboard = buildLeaderboardUseCase.execute()
        val frozenSubmissions =
            findAllSubmissionsByContestSinceLastFreezeUseCase.execute()

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardAdmin(contest.id),
                event = BroadcastEvent.LEADERBOARD_UNFROZEN,
                body =
                    mapOf(
                        "leaderboard" to leaderboard.toResponseBodyDTO(),
                        "announcement" to frozenSubmissions.map { it.toResponseBodyDTO() },
                    ) as Serializable,
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardContestant(contest.id),
                event = BroadcastEvent.LEADERBOARD_UNFROZEN,
                body =
                    mapOf(
                        "leaderboard" to leaderboard.toResponseBodyDTO(),
                        "announcement" to frozenSubmissions.map { it.toResponseBodyDTO() },
                    ) as Serializable,
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardGuest(contest.id),
                event = BroadcastEvent.LEADERBOARD_UNFROZEN,
                body =
                    mapOf(
                        "leaderboard" to leaderboard.toResponseBodyDTO(),
                        "announcement" to frozenSubmissions.map { it.toResponseBodyDTO() },
                    ) as Serializable,
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardJudge(contest.id),
                event = BroadcastEvent.LEADERBOARD_UNFROZEN,
                body =
                    mapOf(
                        "leaderboard" to leaderboard.toResponseBodyDTO(),
                        "announcement" to frozenSubmissions.map { it.toResponseBodyDTO() },
                    ) as Serializable,
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardStaff(contest.id),
                event = BroadcastEvent.LEADERBOARD_UNFROZEN,
                body =
                    mapOf(
                        "leaderboard" to leaderboard.toResponseBodyDTO(),
                        "announcement" to frozenSubmissions.map { it.toResponseBodyDTO() },
                    ) as Serializable,
            ),
        )
    }
}
