package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.scheduler.AutoFreezeJobScheduler
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.verify

class ContestDeletedEventListenerTest :
    FunSpec({
        val autoFreezeJobScheduler = mockk<AutoFreezeJobScheduler>(relaxed = true)

        val sut = ContestDeletedEventListener(autoFreezeJobScheduler = autoFreezeJobScheduler)

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val contest = ContestMockBuilder.build()
            val event = ContestEvent.Deleted(contest)

            sut.onApplicationEvent(event)

            verify {
                autoFreezeJobScheduler.cancel(
                    id = "freeze-contest-${contest.id}",
                )
            }
        }
    })
