package com.forsetijudge.core.application.listener.ticket

import com.forsetijudge.core.domain.entity.TicketMockBuilder
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.ContestantPrivateBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.pprivate.JudgePrivateBroadcastRoom
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import java.io.Serializable

@ActiveProfiles("test")
@SpringBootTest(classes = [TicketUpdatedEventListener::class])
class TicketUpdatedEventListenerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val broadcastProducer: BroadcastProducer,
    private val sut: TicketUpdatedEventListener,
) : FunSpec({
        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val ticket = TicketMockBuilder.build<Serializable>()
            val event = TicketEvent.Updated(ticket)

            sut.onApplicationEvent(event)

            verify { broadcastProducer.produce(AdminDashboardBroadcastRoom(ticket.contest.id).buildTicketUpdatedEvent(ticket)) }
            verify { broadcastProducer.produce(StaffDashboardBroadcastRoom(ticket.contest.id).buildTicketUpdatedEvent(ticket)) }
            verify {
                broadcastProducer.produce(
                    ContestantPrivateBroadcastRoom(ticket.contest.id, ticket.member.id).buildTicketUpdatedEvent(ticket),
                )
            }
            verify {
                broadcastProducer.produce(
                    JudgePrivateBroadcastRoom(ticket.contest.id, ticket.member.id).buildTicketUpdatedEvent(ticket),
                )
            }
        }
    })
