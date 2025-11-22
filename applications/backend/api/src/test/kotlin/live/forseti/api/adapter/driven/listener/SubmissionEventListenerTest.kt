package live.forseti.api.adapter.driven.listener

import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import live.forseti.api.adapter.driven.emitter.StompLeaderboardEmitter
import live.forseti.api.adapter.driven.emitter.StompSubmissionEmitter
import live.forseti.core.application.service.leaderboard.BuildLeaderboardService
import live.forseti.core.domain.entity.SubmissionMockBuilder
import live.forseti.core.domain.event.SubmissionCreatedEvent
import live.forseti.core.domain.event.SubmissionUpdatedEvent
import live.forseti.core.port.dto.output.LeaderboardOutputDTO

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
            every { buildLeaderboardService.build(submission.contest.id) } returns leaderboard

            sut.onApplicationEvent(event)

            verify { submissionEmitter.emit(submission) }
            verify { leaderboardEmitter.emit(leaderboard) }
        }

        test("should emit submission on updated event") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionUpdatedEvent(this, submission)
            val leaderboard = mockk<LeaderboardOutputDTO>()
            every { buildLeaderboardService.build(submission.contest.id) } returns leaderboard

            sut.onApplicationEvent(event)

            verify { submissionEmitter.emit(submission) }
            verify { leaderboardEmitter.emit(leaderboard) }
        }
    })
