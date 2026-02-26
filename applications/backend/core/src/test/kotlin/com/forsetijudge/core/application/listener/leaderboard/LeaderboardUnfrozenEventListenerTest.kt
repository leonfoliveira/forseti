package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.domain.model.LeaderboardMockBuilder
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.submission.FindAllSubmissionsByContestSinceLastFreezeUseCase
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import java.time.OffsetDateTime

@ActiveProfiles("test")
@SpringBootTest(classes = [LeaderboardUnfrozenEventListener::class])
class LeaderboardUnfrozenEventListenerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
    @MockkBean(relaxed = true)
    private val findAllSubmissionsByContestSinceLastFreezeUseCase: FindAllSubmissionsByContestSinceLastFreezeUseCase,
    @MockkBean(relaxed = true)
    private val broadcastProducer: BroadcastProducer,
    private val sut: LeaderboardUnfrozenEventListener,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val contest = ContestMockBuilder.build()
            val frozenAt = OffsetDateTime.now()
            val leaderboard = LeaderboardMockBuilder.build()
            val frozenSubmissions = listOf(SubmissionMockBuilder.build(), SubmissionMockBuilder.build())
            val event = LeaderboardEvent.Unfrozen(contest, frozenAt)
            every { buildLeaderboardUseCase.execute() } returns leaderboard
            every { findAllSubmissionsByContestSinceLastFreezeUseCase.execute(any()) } returns frozenSubmissions

            sut.onApplicationEvent(event)

            verify { broadcastProducer.produce(AdminDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard)) }
            verify {
                broadcastProducer.produce(
                    ContestantDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard, frozenSubmissions),
                )
            }
            verify {
                broadcastProducer.produce(
                    GuestDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard, frozenSubmissions),
                )
            }
            verify { broadcastProducer.produce(JudgeDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard)) }
            verify { broadcastProducer.produce(StaffDashboardBroadcastRoom(contest.id).buildLeaderboardUnfrozenEvent(leaderboard)) }
        }
    })
