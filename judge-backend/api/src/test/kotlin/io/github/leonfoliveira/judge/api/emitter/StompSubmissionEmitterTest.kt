package io.github.leonfoliveira.judge.api.emitter

import io.github.leonfoliveira.judge.api.dto.response.submission.toFullResponseDTO
import io.github.leonfoliveira.judge.api.dto.response.submission.toPublicResponseDTO
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.service.contest.FindContestService
import io.github.leonfoliveira.judge.common.service.dto.output.ContestLeaderboardOutputDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.messaging.simp.SimpMessagingTemplate

class StompSubmissionEmitterTest : FunSpec({
    val messagingTemplate = mockk<SimpMessagingTemplate>(relaxed = true)
    val contestFindContestService = mockk<FindContestService>(relaxed = true)

    val sut =
        StompSubmissionEmitter(
            messagingTemplate = messagingTemplate,
            contestFindContestService = contestFindContestService,
        )

    beforeEach {
        clearAllMocks()
    }

    test("should emmit submission events") {
        val submission = SubmissionMockBuilder.build()
        val leaderboard = mockk<ContestLeaderboardOutputDTO>()
        every { contestFindContestService.buildContestLeaderboard(submission.contest) } returns leaderboard

        sut.emit(submission)

        verify {
            messagingTemplate.convertAndSend(
                "/topic/contests/${submission.contest.id}/submissions",
                submission.toPublicResponseDTO(),
            )
        }
        verify {
            messagingTemplate.convertAndSend(
                "/topic/contests/${submission.contest.id}/submissions/full",
                submission.toFullResponseDTO(),
            )
        }
        verify {
            messagingTemplate.convertAndSend(
                "/topic/members/${submission.member.id}/submissions",
                submission.toPublicResponseDTO(),
            )
        }
        verify {
            messagingTemplate.convertAndSend(
                "/topic/contests/${submission.contest.id}/leaderboard",
                leaderboard,
            )
        }
    }
})
