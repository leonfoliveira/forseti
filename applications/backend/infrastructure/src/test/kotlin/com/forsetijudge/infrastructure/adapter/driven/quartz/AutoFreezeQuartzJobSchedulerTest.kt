package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.infrastructure.adapter.driving.job.AutoFreezeQuartzJob
import com.forsetijudge.infrastructure.adapter.dto.quartz.QuartzMessage
import com.forsetijudge.infrastructure.adapter.dto.quartz.payload.AutoFreezeJobPayload
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import java.time.OffsetDateTime

class AutoFreezeQuartzJobSchedulerTest :
    FunSpec({
        val quartzJobScheduler = mockk<QuartzJobScheduler>(relaxed = true)

        val sut = AutoFreezeQuartzJobScheduler(quartzJobScheduler)

        beforeEach {
            clearAllMocks()
        }

        test("should schedule a job successfully") {
            val contestId = IdGenerator.getUUID()
            val freezeAt = OffsetDateTime.now().plusDays(1)

            sut.schedule(contestId, freezeAt)

            val messageSlot = slot<QuartzMessage<AutoFreezeJobPayload>>()
            verify {
                quartzJobScheduler.schedule(
                    jobClass = AutoFreezeQuartzJob::class,
                    message = capture(messageSlot),
                    at = freezeAt,
                )
            }
            messageSlot.captured.id shouldBe "${AutoFreezeQuartzJobScheduler.JOB_ID_PREFIX}:$contestId"
            messageSlot.captured.payload!!.contestId shouldBe contestId
        }

        test("should cancel a job successfully") {
            val contestId = IdGenerator.getUUID()

            sut.cancel(contestId)

            verify {
                quartzJobScheduler.cancel("${AutoFreezeQuartzJobScheduler.JOB_ID_PREFIX}:$contestId")
            }
        }
    })
