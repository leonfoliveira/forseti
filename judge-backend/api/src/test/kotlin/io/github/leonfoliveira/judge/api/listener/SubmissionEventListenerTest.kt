package io.github.leonfoliveira.judge.api.listener

import io.github.leonfoliveira.judge.api.emitter.StompLeaderboardEmitter
import io.github.leonfoliveira.judge.api.emitter.StompSubmissionEmitter
import io.github.leonfoliveira.judge.common.event.SubmissionEvent
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.service.dto.output.LeaderboardOutputDTO
import io.github.leonfoliveira.judge.common.service.leaderboard.FindLeaderboardService
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class SubmissionEventListenerTest : FunSpec({
    val stompSubmissionEmitter = mockk<StompSubmissionEmitter>(relaxed = true)
    val stompLeaderboardEmitter = mockk<StompLeaderboardEmitter>(relaxed = true)
    val findLeaderboardService = mockk<FindLeaderboardService>(relaxed = true)

    val sut = SubmissionEventListener(stompSubmissionEmitter, stompLeaderboardEmitter, findLeaderboardService)

    beforeEach {
        clearAllMocks()
    }

    test("should emit submission on event") {
        val submission = SubmissionMockBuilder.build()
        val event = SubmissionEvent(this, submission)
        val leaderboard = mockk<LeaderboardOutputDTO>()
        every { findLeaderboardService.findByContestId(submission.contest.id) } returns leaderboard

        sut.onApplicationEvent(event)

        verify { stompSubmissionEmitter.emit(submission) }
        verify { stompLeaderboardEmitter.emit(leaderboard) }
    }
})
