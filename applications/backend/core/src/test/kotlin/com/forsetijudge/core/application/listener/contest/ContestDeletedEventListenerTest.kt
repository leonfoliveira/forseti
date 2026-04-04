package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.job.AutoFreezeJobScheduler
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class ContestDeletedEventListenerTest :
    FunSpec({
        val autoFreezeJobScheduler = mockk<AutoFreezeJobScheduler>(relaxed = true)

        val sut =
            ContestDeletedEventListener(
                autoFreezeJobScheduler = autoFreezeJobScheduler,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val contestId = IdGenerator.getUUID()
            val event = ContestEvent.Deleted(contestId)

            sut.handle(event)

            verify {
                autoFreezeJobScheduler.cancel(contestId)
            }
        }
    })
