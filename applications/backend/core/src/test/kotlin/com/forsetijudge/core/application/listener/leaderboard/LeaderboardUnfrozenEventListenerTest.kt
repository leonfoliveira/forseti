package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.domain.model.LeaderboardMockBuilder
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.external.submission.FindAllSubmissionsByContestSinceLastFreezeUseCase
import com.forsetijudge.core.port.dto.response.leaderboard.toUnfreezeResponseBodyDTO
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

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
    private val webSocketFanoutProducer: WebSocketFanoutProducer,
    private val sut: LeaderboardUnfrozenEventListener,
) : FunSpec({
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
