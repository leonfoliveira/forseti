package com.forsetijudge.api.adapter.driven.emitter

import com.forsetijudge.core.port.driven.WebSocketFanoutProducer
import com.forsetijudge.core.port.dto.output.LeaderboardOutputDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.UUID

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
            val contestId = UUID.randomUUID()
            every { leaderboard.contestId } returns contestId

            sut.emit(leaderboard)

            verify {
                webSocketFanoutProducer.produce(
                    "/topic/contests/$contestId/leaderboard",
                    leaderboard,
                )
            }
        }
    })
