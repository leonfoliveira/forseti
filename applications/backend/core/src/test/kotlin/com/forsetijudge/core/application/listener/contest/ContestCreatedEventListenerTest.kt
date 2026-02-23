package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.scheduler.AutoFreezeJobScheduler
import com.forsetijudge.core.port.driven.scheduler.payload.AutoFreezeJobPayload
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class ContestCreatedEventListenerTest :
    FunSpec({
        val autoFreezeJobScheduler = mockk<AutoFreezeJobScheduler>(relaxed = true)

        val sut = ContestCreatedEventListener(autoFreezeJobScheduler = autoFreezeJobScheduler)

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val contest = ContestMockBuilder.build()
            val event = ContestEvent.Created(contest)

            sut.onApplicationEvent(event)

            verify {
                autoFreezeJobScheduler.schedule(
                    id = "freeze-contest-${contest.id}",
                    payload = AutoFreezeJobPayload(contest.id),
                    at = contest.autoFreezeAt!!,
                )
            }
        }
    })
