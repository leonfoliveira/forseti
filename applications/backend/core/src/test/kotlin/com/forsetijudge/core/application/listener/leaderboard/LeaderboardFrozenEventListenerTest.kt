package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.repository.ContestRepository
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class LeaderboardFrozenEventListenerTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val broadcastProducer = mockk<BroadcastProducer>(relaxed = true)

        val sut =
            LeaderboardFrozenEventListener(
                contestRepository = contestRepository,
                broadcastProducer = broadcastProducer,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val contest = ContestMockBuilder.build()
            val event = LeaderboardEvent.Frozen(contest.id)
            every { contestRepository.findById(contest.id) } returns contest

            sut.handle(event)

            verify { broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent()) }
            verify { broadcastProducer.produce(ContestantDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent()) }
            verify { broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent()) }
            verify { broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent()) }
            verify { broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent()) }
        }
    })
