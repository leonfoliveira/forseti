package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class LeaderboardFrozenEventListener(
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<LeaderboardEvent.Frozen>() {
    @TransactionalEventListener(LeaderboardEvent.Frozen::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: LeaderboardEvent.Frozen) {
        super.onApplicationEvent(event)
    }

    override fun handleEvent(event: LeaderboardEvent.Frozen) {
        val contest = event.contest

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent())
        broadcastProducer.produce(ContestantDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent())
        broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent())
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent())
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent())
    }
}
