package com.forsetijudge.api.adapter.driven.listener

import com.forsetijudge.api.adapter.driven.emitter.StompLeaderboardEmitter
import com.forsetijudge.api.adapter.driven.emitter.StompSubmissionEmitter
import com.forsetijudge.core.application.service.leaderboard.BuildLeaderboardService
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.SubmissionCreatedEvent
import com.forsetijudge.core.domain.event.SubmissionUpdatedEvent
import com.forsetijudge.core.port.dto.output.LeaderboardOutputDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class SubmissionEventListenerTest :
    FunSpec({
        val submissionEmitter = mockk<StompSubmissionEmitter>(relaxed = true)
        val leaderboardEmitter = mockk<StompLeaderboardEmitter>(relaxed = true)
        val buildLeaderboardService = mockk<BuildLeaderboardService>(relaxed = true)

        val sut = SubmissionEventsApiListener(submissionEmitter, leaderboardEmitter, buildLeaderboardService)

        beforeEach {
            clearAllMocks()
        }

        test("should emit submission on created event") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionCreatedEvent(this, submission)
            val leaderboard = mockk<LeaderboardOutputDTO>()
            every { buildLeaderboardService.build(submission.contest.id, null) } returns leaderboard

            sut.onApplicationEvent(event)

            verify { submissionEmitter.emit(submission) }
            verify { leaderboardEmitter.emit(leaderboard) }
        }

        test("should emit submission on updated event") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionUpdatedEvent(this, submission)
            val leaderboard = mockk<LeaderboardOutputDTO>()
            every { buildLeaderboardService.build(submission.contest.id, null) } returns leaderboard

            sut.onApplicationEvent(event)

            verify { submissionEmitter.emit(submission) }
            verify { leaderboardEmitter.emit(leaderboard) }
        }
    })
