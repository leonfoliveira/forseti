package com.forsetijudge.api.adapter.driven.listener

import com.forsetijudge.api.adapter.driven.emitter.StompLeaderboardEmitter
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.LeaderboardFreezeEvent
import com.forsetijudge.core.domain.event.LeaderboardUnfreezeEvent
import com.forsetijudge.core.port.driving.usecase.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.submission.FindSubmissionUseCase
import com.forsetijudge.core.port.dto.output.LeaderboardOutputDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class LeaderboardEventsApiListenerTest :
    FunSpec({
        val leaderboardEmitter = mockk<StompLeaderboardEmitter>(relaxed = true)
        val buildLeaderboardUseCase = mockk<BuildLeaderboardUseCase>(relaxed = true)
        val findSubmissionUseCase = mockk<FindSubmissionUseCase>(relaxed = true)

        val sut = LeaderboardEventsApiListener(leaderboardEmitter, buildLeaderboardUseCase, findSubmissionUseCase)

        beforeEach {
            clearAllMocks()
        }

        test("should emit contest on leaderboard unfreeze event") {
            val contest = ContestMockBuilder.build()
            val event = LeaderboardFreezeEvent(this, contest)

            sut.onApplicationEvent(event)

            verify { leaderboardEmitter.emitFreeze(contest) }
        }

        test("should emit leaderboard and submissions on leaderboard unfreeze event") {
            val contest = ContestMockBuilder.build()
            val event = LeaderboardUnfreezeEvent(this, contest)
            val leaderboard = mockk<LeaderboardOutputDTO>()
            val submissions = listOf(SubmissionMockBuilder.build())
            every { buildLeaderboardUseCase.build(contest.id, null) } returns leaderboard
            every { findSubmissionUseCase.findAllByContestSinceLastFreeze(contest.id) } returns submissions

            sut.onApplicationEvent(event)

            verify { leaderboardEmitter.emitUnfreeze(leaderboard, submissions) }
        }
    })
