package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driving.usecase.internal.leaderboard.BuildLeaderboardInternalUseCase
import com.forsetijudge.core.port.driving.usecase.internal.submission.FindAllSubmissionsByContestSinceLastFreezeInternalUseCase
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class LeaderboardUnfrozenEventListener(
    private val contestRepository: ContestRepository,
    private val buildLeaderboardInternalUseCase: BuildLeaderboardInternalUseCase,
    private val findAllSubmissionsByContestSinceLastFreezeInternalUseCase: FindAllSubmissionsByContestSinceLastFreezeInternalUseCase,
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<LeaderboardEvent.Unfrozen>() {
    @TransactionalEventListener(LeaderboardEvent.Unfrozen::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: LeaderboardEvent.Unfrozen) {
        super.onApplicationEvent(event)
    }

    @Transactional(readOnly = true)
    override fun handleEvent(event: LeaderboardEvent.Unfrozen) {
        val contest =
            contestRepository.findById(event.contestId)
                ?: throw NotFoundException("Could not find contest with id: ${event.contestId}")
        val leaderboard = buildLeaderboardInternalUseCase.execute(BuildLeaderboardInternalUseCase.Command(contest = contest))
        val frozenSubmissions =
            findAllSubmissionsByContestSinceLastFreezeInternalUseCase.execute(
                FindAllSubmissionsByContestSinceLastFreezeInternalUseCase.Command(contest = contest, frozenAt = event.frozenAt),
            )

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard))
        broadcastProducer.produce(
            ContestantDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard, frozenSubmissions),
        )
        broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard, frozenSubmissions))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard))
    }
}
