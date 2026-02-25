package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.domain.entity.ClarificationMockBuilder
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.ContestantPrivateBroadcastRoom
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
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
                    AdminDashboardBroadcastRoom(clarification.contest.id).buildClarificationCreatedEvent(clarification),
                )
            }
            verify {
                broadcastProducer.produce(
                    ContestantDashboardBroadcastRoom(clarification.contest.id).buildClarificationCreatedEvent(clarification),
                )
            }
            verify {
                broadcastProducer.produce(
                    GuestDashboardBroadcastRoom(clarification.contest.id).buildClarificationCreatedEvent(clarification),
                )
            }
            verify {
                broadcastProducer.produce(
                    JudgeDashboardBroadcastRoom(clarification.contest.id).buildClarificationCreatedEvent(clarification),
                )
            }
            verify {
                broadcastProducer.produce(
                    StaffDashboardBroadcastRoom(clarification.contest.id).buildClarificationCreatedEvent(clarification),
                )
            }
        }

        test("should handle event successfully with parent") {
            val parent = ClarificationMockBuilder.build()
            val clarification = ClarificationMockBuilder.build(parent = parent)
            val event = ClarificationEvent.Created(clarification = clarification)

            sut.onApplicationEvent(event)

            verify {
                broadcastProducer.produce(
                    ContestantPrivateBroadcastRoom(parent.member.id).buildClarificationAnsweredEvent(
                        clarification,
                    ),
                )
            }
        }
    })
