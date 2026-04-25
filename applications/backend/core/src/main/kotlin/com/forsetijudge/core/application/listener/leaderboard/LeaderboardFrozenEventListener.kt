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
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class LeaderboardFrozenEventListener(
    private val contestRepository: ContestRepository,
    private val broadcastProducer: BroadcastProducer,
) : BusinessEventListener<LeaderboardEvent.Frozen> {
    @Transactional
    override fun handle(event: LeaderboardEvent.Frozen) {
        val contest =
            contestRepository.findById(event.contestId)
                ?: throw NotFoundException("Could not find contest with id: ${event.contestId}")

        broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent())
        broadcastProducer.produce(ContestantDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent())
        broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent())
        broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent())
        broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent())
    }
}
