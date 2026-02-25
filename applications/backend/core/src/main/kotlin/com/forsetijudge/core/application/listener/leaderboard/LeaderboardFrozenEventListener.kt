package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class LeaderboardFrozenEventListener(
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<Contest, LeaderboardEvent.Frozen>() {
    @TransactionalEventListener(LeaderboardEvent.Frozen::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: LeaderboardEvent.Frozen) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Contest) {
        val contest = payload

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardAdmin(contest.id),
                event = BroadcastEvent.LEADERBOARD_FROZEN,
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardContestant(contest.id),
                event = BroadcastEvent.LEADERBOARD_FROZEN,
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardGuest(contest.id),
                event = BroadcastEvent.LEADERBOARD_FROZEN,
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardJudge(contest.id),
                event = BroadcastEvent.LEADERBOARD_FROZEN,
            ),
        )

        broadcastProducer.produce(
            BroadcastPayload(
                topic = BroadcastTopic.ContestsDashboardStaff(contest.id),
                event = BroadcastEvent.LEADERBOARD_FROZEN,
            ),
        )
    }
}
