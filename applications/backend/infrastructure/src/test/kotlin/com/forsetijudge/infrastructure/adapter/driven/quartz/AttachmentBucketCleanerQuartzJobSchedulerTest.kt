package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.forsetijudge.infrastructure.adapter.driving.job.AttachmentBucketCleanerQuartzJob
import com.forsetijudge.infrastructure.adapter.dto.quartz.QuartzMessage
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.slot
import io.mockk.verify
import java.time.OffsetDateTime
import kotlin.time.Duration.Companion.minutes
import kotlin.time.toJavaDuration

class AttachmentBucketCleanerQuartzJobSchedulerTest :
    FunSpec({
        val quartzJobScheduler = mockk<QuartzJobScheduler>(relaxed = true)

        val sut = AttachmentBucketCleanerQuartzJobScheduler(quartzJobScheduler)

        val now = OffsetDateTime.now()

        beforeEach {
            clearAllMocks()
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
        }

        test("should schedule a job successfully") {
            val interval = 30.minutes

            sut.schedule(interval)

            val messageSlot = slot<QuartzMessage<*>>()
            verify {
                quartzJobScheduler.schedule(
                    jobClass = AttachmentBucketCleanerQuartzJob::class,
                    message = capture(messageSlot),
                    startAt = now.plus(interval.toJavaDuration()),
                    interval = interval.toJavaDuration(),
                )
            }
            messageSlot.captured.id shouldBe AttachmentBucketCleanerQuartzJobScheduler.ID
        }
    })
