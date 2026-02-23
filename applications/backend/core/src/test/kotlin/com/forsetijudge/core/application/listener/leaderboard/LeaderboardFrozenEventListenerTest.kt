package com.forsetijudge.core.application.listener.leaderboard

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.port.driven.producer.WebSocketFanoutProducer
import com.forsetijudge.core.port.driven.producer.payload.WebSocketFanoutPayload
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class LeaderboardFrozenEventListenerTest :
    FunSpec({
        val webSocketFanoutProducer = mockk<WebSocketFanoutProducer>(relaxed = true)

        val sut = LeaderboardFrozenEventListener(webSocketFanoutProducer = webSocketFanoutProducer)

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val contest = ContestMockBuilder.build()
            val event = LeaderboardEvent.Frozen(contest)

            sut.onApplicationEvent(event)

            verify {
                webSocketFanoutProducer.produce(
                    WebSocketFanoutPayload(
                        "/topic/contests/${contest.id}/leaderboard:frozen",
                    ),
                )
            }
        }
    })
