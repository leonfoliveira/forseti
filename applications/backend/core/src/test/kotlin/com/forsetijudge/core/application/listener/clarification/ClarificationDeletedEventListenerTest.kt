package com.forsetijudge.core.application.listener.clarification

import com.forsetijudge.core.application.helper.IdGenerator
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.port.driven.broadcast.BroadcastProducer
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.AdminDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.ContestantDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.GuestDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.JudgeDashboardBroadcastRoom
import com.forsetijudge.core.port.driven.broadcast.room.dashboard.StaffDashboardBroadcastRoom
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class ClarificationDeletedEventListenerTest :
    FunSpec({
        val broadcastProducer = mockk<BroadcastProducer>(relaxed = true)

        val sut =
            ClarificationDeletedEventListener(
                broadcastProducer = broadcastProducer,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val contestId = IdGenerator.getUUID()
            val clarificationId = IdGenerator.getUUID()
            val event = ClarificationEvent.Deleted(contestId, clarificationId)

            sut.handle(event)

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
