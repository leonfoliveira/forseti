package com.forsetijudge.core.application.listener.submission

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.SubmissionEvent
import com.forsetijudge.core.domain.model.LeaderboardMockBuilder
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.BuildLeaderboardCellUseCase
import com.forsetijudge.core.port.dto.response.leaderboard.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeAndExecutionResponseBodyDTO
import com.forsetijudge.core.port.dto.response.submission.toWithCodeResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime

class SubmissionUpdatedEventListenerTest :
    FunSpec({
        val buildLeaderboardCellUseCase = mockk<BuildLeaderboardCellUseCase>(relaxed = true)
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut =
            SubmissionUpdatedEventListener(
                webSocketFanoutProducer = webSocketFanoutProducer,
                buildLeaderboardCellUseCase = buildLeaderboardCellUseCase,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val submission = SubmissionMockBuilder.build()
            val leaderboardCell = LeaderboardMockBuilder.buildCell()
            val event = SubmissionEvent.Updated(submission)
            every {
                buildLeaderboardCellUseCase.execute(
                    BuildLeaderboardCellUseCase.Command(
                        memberId = submission.member.id,
                        problemId = submission.problem.id,
                    ),
                )
            } returns Pair(leaderboardCell, submission.memberId)

            sut.onApplicationEvent(event)

            verify {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${submission.contest.id}}/submissions",
                        submission.toResponseBodyDTO(),
                    ),
                )
            }
            verify {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${submission.contest.id}/submissions:with-code-and-execution",
                        submission.toWithCodeAndExecutionResponseBodyDTO(),
                    ),
                )
            }
            verify {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${submission.contest.id}/members/${submission.member.id}/submissions:with-code",
                        submission.toWithCodeResponseBodyDTO(),
                    ),
                )
            }
            verify {
                buildLeaderboardCellUseCase.execute(
                    BuildLeaderboardCellUseCase.Command(
                        memberId = submission.member.id,
                        problemId = submission.problem.id,
                    ),
                )
            }
            verify {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${submission.contest.id}/leaderboard:cell",
                        leaderboardCell.toResponseBodyDTO(submission.member.id),
                    ),
                )
            }
        }

        test("should not produce to submission topic and leaderboard cell topic if contest is frozen") {
            val contest =
                ContestMockBuilder.build(
                    frozenAt = OffsetDateTime.now().minusHours(1),
                )
            val problem = ProblemMockBuilder.build(contest = contest)
            val submission = SubmissionMockBuilder.build(problem = problem)
            val leaderboardCell = LeaderboardMockBuilder.buildCell()
            every {
                buildLeaderboardCellUseCase.execute(
                    BuildLeaderboardCellUseCase.Command(
                        memberId = submission.member.id,
                        problemId = submission.problem.id,
                    ),
                )
            } returns Pair(leaderboardCell, submission.memberId)
            val event = SubmissionEvent.Updated(submission)

            sut.onApplicationEvent(event)

            verify(exactly = 0) {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${submission.contest.id}}/submissions",
                        submission.toResponseBodyDTO(),
                    ),
                )
            }
            verify(exactly = 0) {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${submission.contest.id}/leaderboard:cell",
                        leaderboardCell.toResponseBodyDTO(submission.member.id),
                    ),
                )
            }
        }
    })
