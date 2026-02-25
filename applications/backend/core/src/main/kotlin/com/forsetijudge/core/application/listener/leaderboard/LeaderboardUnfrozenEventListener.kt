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
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.submission.FindAllSubmissionsByContestSinceLastFreezeUseCase
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

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

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard))
        broadcastProducer.produce(
            ContestantDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard, frozenSubmissions),
        )
        broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard, frozenSubmissions))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard))
    }
}
