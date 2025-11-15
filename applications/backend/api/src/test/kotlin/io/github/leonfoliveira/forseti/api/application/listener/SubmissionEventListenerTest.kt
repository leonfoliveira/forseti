package io.github.leonfoliveira.forseti.api.application.listener

import io.github.leonfoliveira.forseti.api.application.port.driven.LeaderboardEmitter
import io.github.leonfoliveira.forseti.api.application.port.driven.SubmissionEmitter
import io.github.leonfoliveira.forseti.common.application.domain.event.SubmissionCreatedEvent
import io.github.leonfoliveira.forseti.common.application.domain.event.SubmissionUpdatedEvent
import io.github.leonfoliveira.forseti.common.application.service.dto.output.LeaderboardOutputDTO
import io.github.leonfoliveira.forseti.common.application.service.leaderboard.FindLeaderboardService
import io.github.leonfoliveira.forseti.common.mock.entity.SubmissionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class SubmissionEventListenerTest :
    FunSpec({
        val submissionEmitter = mockk<SubmissionEmitter>(relaxed = true)
        val leaderboardEmitter = mockk<LeaderboardEmitter>(relaxed = true)
        val findLeaderboardService = mockk<FindLeaderboardService>(relaxed = true)

        val sut = SubmissionEventsApiListener(submissionEmitter, leaderboardEmitter, findLeaderboardService)

        beforeEach {
            clearAllMocks()
        }

        test("should emit submission on created event") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionCreatedEvent(this, submission)
            val leaderboard = mockk<LeaderboardOutputDTO>()
            every { findLeaderboardService.findByContestId(submission.contest.id) } returns leaderboard

            sut.onApplicationEvent(event)

            verify { submissionEmitter.emit(submission) }
            verify { leaderboardEmitter.emit(leaderboard) }
        }

        test("should emit submission on updated event") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionUpdatedEvent(this, submission)
            val leaderboard = mockk<LeaderboardOutputDTO>()
            every { findLeaderboardService.findByContestId(submission.contest.id) } returns leaderboard

            sut.onApplicationEvent(event)

            verify { submissionEmitter.emit(submission) }
            verify { leaderboardEmitter.emit(leaderboard) }
        }
    })
