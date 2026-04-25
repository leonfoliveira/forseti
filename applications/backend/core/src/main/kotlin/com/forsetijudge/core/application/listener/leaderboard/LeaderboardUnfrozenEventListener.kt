package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.application.helper.submission.SubmissionFinder
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.repository.ContestRepository
import org.springframework.stereotype.Component

@Component
class LeaderboardUnfrozenEventListener(
    private val contestRepository: ContestRepository,
    private val leaderboardBuilder: LeaderboardBuilder,
    private val submissionFinder: SubmissionFinder,
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<LeaderboardEvent.Unfrozen> {
    override fun handle(event: LeaderboardEvent.Unfrozen) {
        val contest =
            contestRepository.findById(event.contestId)
                ?: throw NotFoundException("Could not find contest with id: ${event.contestId}")
        val leaderboard = leaderboardBuilder.build(contest = contest)
        val frozenSubmissions = submissionFinder.findAllByContestSinceLastFreeze(contest = contest, frozenAt = event.frozenAt)

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard))
        broadcastProducer.produce(
            ContestantDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard, frozenSubmissions),
        )
        broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard, frozenSubmissions))
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard))
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard))
    }
}
