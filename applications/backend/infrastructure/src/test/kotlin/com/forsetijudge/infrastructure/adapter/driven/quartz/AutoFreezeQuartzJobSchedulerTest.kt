package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.forsetijudge.core.application.helper.IdGenerator
import com.forsetijudge.infrastructure.adapter.driving.job.QueueableQuartzJob
import com.forsetijudge.infrastructure.adapter.dto.quartz.QuartzMessage
import com.forsetijudge.infrastructure.adapter.dto.quartz.body.QueueableJobMessageBody
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.AutoFreezeQueueMessageBody
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
        val exchange = "test-exchange"
        val routingKey = "test-routing-key"

        val sut =
            AutoFreezeQuartzJobScheduler(
                quartzJobScheduler = quartzJobScheduler,
                exchange = exchange,
                routingKey = routingKey,
            )

        beforeEach {
            clearAllMocks()
        }

        test("should schedule a job successfully") {
            val contestId = IdGenerator.getUUID()
            val freezeAt = OffsetDateTime.now().plusDays(1)

            sut.schedule(contestId, freezeAt)

            val messageSlot = slot<QuartzMessage<QueueableJobMessageBody>>()
            verify {
                quartzJobScheduler.schedule(
                    jobClass = QueueableQuartzJob::class,
                    message = capture(messageSlot),
                    at = freezeAt,
                )
            }
            val message = messageSlot.captured
            message.id shouldBe "${AutoFreezeQuartzJobScheduler.JOB_ID_PREFIX}:$contestId"
            message.body.exchange shouldBe exchange
            message.body.routingKey shouldBe routingKey
            val body = message.body.body as AutoFreezeQueueMessageBody
            body.contestId shouldBe contestId
        }

        test("should cancel a job successfully") {
            val contestId = IdGenerator.getUUID()

            sut.cancel(contestId)

            verify {
                quartzJobScheduler.cancel("${AutoFreezeQuartzJobScheduler.JOB_ID_PREFIX}:$contestId")
            }
        }
    })
