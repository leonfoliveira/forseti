package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.domain.entity.ClarificationMockBuilder
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.dto.response.clarification.toIdResponseBodyDTO
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [ClarificationDeletedEventListener::class])
class ClarificationDeletedEventListenerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val broadcastProducer: BroadcastProducer,
    private val sut: ClarificationDeletedEventListener,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val clarification = ClarificationMockBuilder.build()
            val event = ClarificationEvent.Deleted(clarification = clarification)

            sut.onApplicationEvent(event)
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardAdmin(clarification.contest.id),
                        event = BroadcastEvent.CLARIFICATION_DELETED,
                        body = clarification.toIdResponseBodyDTO(),
                    ),
                )
            }
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardContestant(clarification.contest.id),
                        event = BroadcastEvent.CLARIFICATION_DELETED,
                        body = clarification.toIdResponseBodyDTO(),
                    ),
                )
            }
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardGuest(clarification.contest.id),
                        event = BroadcastEvent.CLARIFICATION_DELETED,
                        body = clarification.toIdResponseBodyDTO(),
                    ),
                )
            }
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardJudge(clarification.contest.id),
                        event = BroadcastEvent.CLARIFICATION_DELETED,
                        body = clarification.toIdResponseBodyDTO(),
                    ),
                )
            }
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardStaff(clarification.contest.id),
                        event = BroadcastEvent.CLARIFICATION_DELETED,
                        body = clarification.toIdResponseBodyDTO(),
                    ),
                )
            }
        }
    })
