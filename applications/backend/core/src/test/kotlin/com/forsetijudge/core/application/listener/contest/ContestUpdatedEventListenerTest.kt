package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.scheduler.AutoFreezeJobScheduler
import com.forsetijudge.core.port.driven.scheduler.payload.AutoFreezeJobPayload
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime

class ContestUpdatedEventListenerTest :
    FunSpec({
        val autoFreezeJobScheduler = mockk<AutoFreezeJobScheduler>(relaxed = true)

        val sut = ContestUpdatedEventListener(autoFreezeJobScheduler = autoFreezeJobScheduler)

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully to freeze") {
            val contest = ContestMockBuilder.build(autoFreezeAt = OffsetDateTime.now())
            val event = ContestEvent.Updated(contest)

            sut.onApplicationEvent(event)

            verify {
                autoFreezeJobScheduler.schedule(
                    id = "freeze-contest-${contest.id}",
                    payload = AutoFreezeJobPayload(contest.id),
                    at = contest.autoFreezeAt!!,
                )
            }
        }

        test("should handle event successfully to not freeze") {
            val contest = ContestMockBuilder.build(autoFreezeAt = null)
            val event = ContestEvent.Updated(contest)

            sut.onApplicationEvent(event)

            verify {
                autoFreezeJobScheduler.cancel("freeze-contest-${contest.id}")
            }
        }
    })
