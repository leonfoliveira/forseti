package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [LeaderboardFrozenEventListener::class])
class LeaderboardFrozenEventListenerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val broadcastProducer: BroadcastProducer,
    private val sut: LeaderboardFrozenEventListener,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val contest = ContestMockBuilder.build()
            val event = LeaderboardEvent.Frozen(contest)

            sut.onApplicationEvent(event)

            verify { broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent()) }
            verify { broadcastProducer.produce(ContestantDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent()) }
            verify { broadcastProducer.produce(GuestDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent()) }
            verify { broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent()) }
            verify { broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildLeaderboardFrozenEvent()) }
        }
    })
