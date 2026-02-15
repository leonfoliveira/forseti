package com.forsetijudge.api.adapter.driving.listener

import com.forsetijudge.api.adapter.driving.listener.ContestEventsApiListener
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.event.ContestCreatedEvent
import com.forsetijudge.core.domain.event.ContestDeletedEvent
import com.forsetijudge.core.domain.event.ContestUpdatedEvent
import com.forsetijudge.core.port.driven.scheduler.AutoFreezeJobScheduler
import io.kotest.core.spec.style.FunSpec
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime

class ContestEventsApiListenerTest :
    FunSpec({
        val autoFreezeJobScheduler = mockk<AutoFreezeJobScheduler>(relaxed = true)

        val sut = ContestEventsApiListener(autoFreezeJobScheduler)

        test("should schedule auto freeze job when contest is created with autoFreezeAt") {
            val contest = ContestMockBuilder.build(autoFreezeAt = OffsetDateTime.now())
            val event = ContestCreatedEvent(this, contest)

            sut.onApplicationEvent(event)

            verify { autoFreezeJobScheduler.schedule(contest) }
        }

        test("should cancel and reschedule auto freeze job when contest is updated with new autoFreezeAt") {
            val contest = ContestMockBuilder.build(autoFreezeAt = OffsetDateTime.now())
            val event = ContestUpdatedEvent(this, contest)

            sut.onApplicationEvent(event)

            verify { autoFreezeJobScheduler.cancel(contest) }
            verify { autoFreezeJobScheduler.schedule(contest) }
        }

        test("should cancel auto freeze job when contest is deleted") {
            val contest = ContestMockBuilder.build()
            val event = ContestDeletedEvent(this, contest)

            sut.onApplicationEvent(event)

            verify { autoFreezeJobScheduler.cancel(contest) }
        }
    })
