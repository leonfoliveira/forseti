package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.job.AutoFreezeJobScheduler
import com.forsetijudge.core.port.driven.repository.ContestRepository
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class ContestCreatedEventListenerTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val autoFreezeJobScheduler = mockk<AutoFreezeJobScheduler>(relaxed = true)

        val sut =
            ContestCreatedEventListener(
                contestRepository = contestRepository,
                autoFreezeJobScheduler = autoFreezeJobScheduler,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should handle event successfully") {
            val contest = ContestMockBuilder.build()
            val event = ContestEvent.Created(contest.id)
            every { contestRepository.findById(contest.id) } returns contest

            sut.handle(event)

            verify {
                autoFreezeJobScheduler.schedule(
                    contestId = contest.id,
                    freezeAt = contest.autoFreezeAt!!,
                )
            }
        }
    })
