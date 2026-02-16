package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.dto.output.LeaderboardPartialOutputDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class StompLeaderboardPartialEmitterTest :
    FunSpec({
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut =
            StompLeaderboardPartialEmitter(webSocketFanoutProducer)

        beforeEach {
            clearAllMocks()
        }

        test("should emit leaderboard partial events") {
            val leaderboardPartial = mockk<LeaderboardPartialOutputDTO>(relaxed = true)
            val contest = ContestMockBuilder.build()

            sut.emit(contest, leaderboardPartial)

            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/${contest.id}/leaderboard/partial",
                    leaderboardPartial,
                )
            }
        }
    })
