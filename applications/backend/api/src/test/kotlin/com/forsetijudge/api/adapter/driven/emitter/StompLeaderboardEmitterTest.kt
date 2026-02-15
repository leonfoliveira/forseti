package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.api.adapter.dto.response.submission.toPublicResponseDTO
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.dto.output.LeaderboardOutputDTO
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.io.Serializable

class StompLeaderboardEmitterTest :
    FunSpec({
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut =
            StompLeaderboardEmitter(webSocketFanoutProducer)

        beforeEach {
            clearAllMocks()
        }

        test("should emit leaderboard events") {
            val leaderboard = mockk<LeaderboardOutputDTO>(relaxed = true)
            val contestId = UuidCreator.getTimeOrderedEpoch()
            every { leaderboard.contestId } returns contestId

            sut.emit(leaderboard)

            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/$contestId/leaderboard",
                    leaderboard,
                )
            }
        }

        test("should emit freeze events") {
            val contest = ContestMockBuilder.build()

            sut.emitFreeze(contest)

            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/${contest.id}/leaderboard/freeze",
                    emptyMap<String, String>() as Serializable,
                )
            }
        }

        test("should emit unfreeze events") {
            val leaderboard = mockk<LeaderboardOutputDTO>(relaxed = true)
            val contestId = UuidCreator.getTimeOrderedEpoch()
            every { leaderboard.contestId } returns contestId

            val frozenSubmissions = listOf(SubmissionMockBuilder.build())

            sut.emitUnfreeze(leaderboard, frozenSubmissions)

            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/$contestId/leaderboard/unfreeze",
                    mapOf(
                        "leaderboard" to leaderboard,
                        "frozenSubmissions" to frozenSubmissions.map { it.toPublicResponseDTO() },
                    ) as Serializable,
                )
            }
        }
    })
