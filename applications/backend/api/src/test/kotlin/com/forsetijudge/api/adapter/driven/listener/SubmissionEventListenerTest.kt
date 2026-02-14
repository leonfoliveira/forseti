package com.forsetijudge.api.adapter.driven.listener

import com.forsetijudge.api.adapter.driven.emitter.StompLeaderboardPartialEmitter
import com.forsetijudge.api.adapter.driven.emitter.StompSubmissionEmitter
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.SubmissionCreatedEvent
import com.forsetijudge.core.domain.event.SubmissionUpdatedEvent
import com.forsetijudge.core.port.driving.usecase.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.dto.output.LeaderboardPartialOutputDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class SubmissionEventListenerTest :
    FunSpec({
        val submissionEmitter = mockk<StompSubmissionEmitter>(relaxed = true)
        val leaderboardPartialEmitter = mockk<StompLeaderboardPartialEmitter>(relaxed = true)
        val buildLeaderboardUseCase = mockk<BuildLeaderboardUseCase>(relaxed = true)

        val sut = SubmissionEventsApiListener(submissionEmitter, leaderboardPartialEmitter, buildLeaderboardUseCase)

        beforeEach {
            clearAllMocks()
        }

        test("should emit submission on created event") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionCreatedEvent(this, submission)
            val leaderboardPartial = mockk<LeaderboardPartialOutputDTO>()
            every { buildLeaderboardUseCase.buildPartial(submission.member.id, submission.problem.id) } returns leaderboardPartial

            sut.onApplicationEvent(event)

            verify { submissionEmitter.emit(submission) }
            verify { leaderboardPartialEmitter.emit(submission.contest, leaderboardPartial) }
        }

        test("should emit submission on updated event") {
            val submission = SubmissionMockBuilder.build()
            val event = SubmissionUpdatedEvent(this, submission)
            val leaderboardPartial = mockk<LeaderboardPartialOutputDTO>()
            every { buildLeaderboardUseCase.buildPartial(submission.member.id, submission.problem.id) } returns leaderboardPartial

            sut.onApplicationEvent(event)

            verify { submissionEmitter.emit(submission) }
            verify { leaderboardPartialEmitter.emit(submission.contest, leaderboardPartial) }
        }
    })
