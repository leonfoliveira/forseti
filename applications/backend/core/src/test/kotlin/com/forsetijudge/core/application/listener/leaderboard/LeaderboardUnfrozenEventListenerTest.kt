package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.domain.model.LeaderboardMockBuilder
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.submission.FindAllSubmissionsByContestSinceLastFreezeUseCase
import com.forsetijudge.core.port.dto.response.leaderboard.toUnfreezeResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class LeaderboardUnfrozenEventListenerTest :
    FunSpec({
        val buildLeaderboardUseCase = mockk<BuildLeaderboardUseCase>(relaxed = true)
        val findAllSubmissionsByContestSinceLastFreezeUseCase = mockk<FindAllSubmissionsByContestSinceLastFreezeUseCase>(relaxed = true)
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut =
            LeaderboardUnfrozenEventListener(
                buildLeaderboardUseCase = buildLeaderboardUseCase,
                findAllSubmissionsByContestSinceLastFreezeUseCase = findAllSubmissionsByContestSinceLastFreezeUseCase,
                webSocketFanoutProducer = webSocketFanoutProducer,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val contest = ContestMockBuilder.build()
            val leaderboard = LeaderboardMockBuilder.build()
            val frozenSubmissions = listOf(SubmissionMockBuilder.build(), SubmissionMockBuilder.build())
            val event = LeaderboardEvent.Unfrozen(contest)
            every { buildLeaderboardUseCase.execute() } returns leaderboard
            every { findAllSubmissionsByContestSinceLastFreezeUseCase.execute() } returns frozenSubmissions

            sut.onApplicationEvent(event)

            verify {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${leaderboard.contestId}/leaderboard:unfrozen",
                        leaderboard.toUnfreezeResponseBodyDTO(frozenSubmissions),
                    ),
                )
            }
        }
    })
