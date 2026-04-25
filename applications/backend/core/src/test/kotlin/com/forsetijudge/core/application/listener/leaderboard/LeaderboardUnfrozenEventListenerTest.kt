package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.application.helper.leaderboard.LeaderboardBuilder
import com.forsetijudge.core.application.helper.submission.SubmissionFinder
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
import com.forsetijudge.core.port.driven.repository.ContestRepository
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime

class LeaderboardUnfrozenEventListenerTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val leaderboardBuilder = mockk<LeaderboardBuilder>(relaxed = true)
        val submissionFinder = mockk<SubmissionFinder>(relaxed = true)
        val broadcastProducer = mockk<BroadcastProducer>(relaxed = true)

        val sut =
            LeaderboardUnfrozenEventListener(
                contestRepository = contestRepository,
                leaderboardBuilder = leaderboardBuilder,
                submissionFinder = submissionFinder,
                broadcastProducer = broadcastProducer,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val contest = ContestMockBuilder.build()
            val frozenAt = OffsetDateTime.now()
            val leaderboard = LeaderboardMockBuilder.build()
            val frozenSubmissions = listOf(SubmissionMockBuilder.build(), SubmissionMockBuilder.build())
            val event = LeaderboardEvent.Unfrozen(contest.id, frozenAt)
            every { contestRepository.findById(contest.id) } returns contest
            every { leaderboardBuilder.build(contest = contest) } returns leaderboard
            every { submissionFinder.findAllByContestSinceLastFreeze(any(), any()) } returns frozenSubmissions

            sut.handle(event)

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
