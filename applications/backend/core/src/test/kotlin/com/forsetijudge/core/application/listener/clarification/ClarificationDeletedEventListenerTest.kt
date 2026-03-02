package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ClarificationMockBuilder
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
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
            val contestId = IdGenerator.getUUID()
            val clarificationId = IdGenerator.getUUID()
            val event = ClarificationEvent.Deleted(contestId, clarificationId)

            sut.onApplicationEvent(event)

            verify {
                broadcastProducer.produce(
                    AdminDashboardBroadcastRoom(contestId).buildClarificationDeletedEvent(clarificationId),
                )
            }
            verify {
                broadcastProducer.produce(
                    ContestantDashboardBroadcastRoom(contestId).buildClarificationDeletedEvent(clarificationId),
                )
            }
            verify {
                broadcastProducer.produce(
                    GuestDashboardBroadcastRoom(contestId).buildClarificationDeletedEvent(clarificationId),
                )
            }
            verify {
                broadcastProducer.produce(
                    JudgeDashboardBroadcastRoom(contestId).buildClarificationDeletedEvent(clarificationId),
                )
            }
            verify {
                broadcastProducer.produce(
                    StaffDashboardBroadcastRoom(contestId).buildClarificationDeletedEvent(clarificationId),
                )
            }
        }
    })
