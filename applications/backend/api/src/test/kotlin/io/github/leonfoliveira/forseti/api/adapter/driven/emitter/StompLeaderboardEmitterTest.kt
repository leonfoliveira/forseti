package io.github.leonfoliveira.forseti.api.adapter.driven.emitter

import io.github.leonfoliveira.forseti.common.application.service.dto.output.LeaderboardOutputDTO
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.messaging.simp.SimpMessagingTemplate
import java.util.UUID

class StompLeaderboardEmitterTest :
    FunSpec({
        val messagingTemplate = mockk<SimpMessagingTemplate>(relaxed = true)

        val sut =
            StompLeaderboardEmitter(
                messagingTemplate = messagingTemplate,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should emit leaderboard events") {
            val leaderboard = mockk<LeaderboardOutputDTO>(relaxed = true)
            val contestId = UUID.randomUUID()
            every { leaderboard.contestId } returns contestId

            sut.emit(leaderboard)

            verify {
                messagingTemplate.convertAndSend(
                    "/topic/contests/$contestId/leaderboard",
                    leaderboard,
                )
            }
        }
    })
