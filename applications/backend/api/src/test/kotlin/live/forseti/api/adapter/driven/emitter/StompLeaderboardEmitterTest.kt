package live.forseti.api.adapter.driven.emitter

import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import live.forseti.core.port.driven.WebSocketFanoutProducer
import live.forseti.core.port.dto.output.LeaderboardOutputDTO
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
