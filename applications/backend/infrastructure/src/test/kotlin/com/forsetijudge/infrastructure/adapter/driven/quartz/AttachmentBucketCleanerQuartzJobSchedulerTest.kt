package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.forsetijudge.infrastructure.adapter.driving.job.QueueableQuartzJob
import com.forsetijudge.infrastructure.adapter.dto.quartz.QuartzMessage
import com.forsetijudge.infrastructure.adapter.dto.quartz.body.QueueableJobMessageBody
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
        val exchange = "test-exchange"
        val routingKey = "test-routing-key"

        val sut =
            AttachmentBucketCleanerQuartzJobScheduler(
                quartzJobScheduler = quartzJobScheduler,
                exchange = exchange,
                routingKey = routingKey,
            )

        val now = OffsetDateTime.now()

        beforeEach {
            clearAllMocks()
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
        }

        test("should schedule a job successfully") {
            val interval = 30.minutes

            sut.schedule(interval)

            val messageSlot = slot<QuartzMessage<QueueableJobMessageBody>>()
            verify {
                quartzJobScheduler.schedule(
                    jobClass = QueueableQuartzJob::class,
                    message = capture(messageSlot),
                    startAt = now.plus(interval.toJavaDuration()),
                    interval = interval.toJavaDuration(),
                )
            }
            val message = messageSlot.captured
            message.id shouldBe AttachmentBucketCleanerQuartzJobScheduler.ID
            message.body.exchange shouldBe exchange
            message.body.routingKey shouldBe routingKey
        }
    })
