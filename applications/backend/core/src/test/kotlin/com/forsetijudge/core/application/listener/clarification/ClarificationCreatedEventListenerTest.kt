package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.domain.entity.ClarificationMockBuilder
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.BroadcastTopic
import com.forsetijudge.core.port.driven.broadcast.payload.BroadcastPayload
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.dto.response.clarification.toResponseBodyDTO
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(classes = [ClarificationCreatedEventListener::class])
class ClarificationCreatedEventListenerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val broadcastProducer: BroadcastProducer,
    private val sut: ClarificationCreatedEventListener,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully without parent") {
            val clarification = ClarificationMockBuilder.build(parent = null)
            val event = ClarificationEvent.Created(clarification = clarification)

            sut.onApplicationEvent(event)
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardAdmin(clarification.contest.id),
                        event = BroadcastEvent.CLARIFICATION_CREATED,
                        body = clarification.toResponseBodyDTO(),
                    ),
                )
            }
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardContestant(clarification.contest.id),
                        event = BroadcastEvent.CLARIFICATION_CREATED,
                        body = clarification.toResponseBodyDTO(),
                    ),
                )
            }
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardGuest(clarification.contest.id),
                        event = BroadcastEvent.CLARIFICATION_CREATED,
                        body = clarification.toResponseBodyDTO(),
                    ),
                )
            }
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardJudge(clarification.contest.id),
                        event = BroadcastEvent.CLARIFICATION_CREATED,
                        body = clarification.toResponseBodyDTO(),
                    ),
                )
            }
            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsDashboardStaff(clarification.contest.id),
                        event = BroadcastEvent.CLARIFICATION_CREATED,
                        body = clarification.toResponseBodyDTO(),
                    ),
                )
            }
        }

        test("should handle event successfully with parent") {
            val parentClarification = ClarificationMockBuilder.build(parent = null)
            val clarification = ClarificationMockBuilder.build(parent = parentClarification)
            val event = ClarificationEvent.Created(clarification = clarification)

            sut.onApplicationEvent(event)

            verify {
                broadcastProducer.produce(
                    BroadcastPayload(
                        topic = BroadcastTopic.ContestsMembers(parentClarification.contest.id, parentClarification.member.id),
                        event = BroadcastEvent.CLARIFICATION_ANSWERED,
                        body = clarification.toResponseBodyDTO(),
                    ),
                )
            }
        }
    })
