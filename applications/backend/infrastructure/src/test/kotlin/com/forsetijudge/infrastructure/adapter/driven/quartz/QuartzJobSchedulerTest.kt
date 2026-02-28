package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.infrastructure.adapter.dto.quartz.QuartzMessage
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.quartz.Job
import org.quartz.JobDetail
import org.quartz.JobKey
import org.quartz.Scheduler
import org.quartz.Trigger
import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit
import kotlin.time.Duration.Companion.seconds
import kotlin.time.toJavaDuration

class QuartzJobSchedulerTest :
    FunSpec({
        val scheduler = mockk<Scheduler>(relaxed = true)
        val objectMapper = ObjectMapper()

        val sut = QuartzJobScheduler(scheduler, objectMapper)

        beforeTest {
            clearAllMocks()
        }

        test("schedule at") {
            val jobClass = mockk<Job>()
            val message =
                QuartzMessage(
                    id = "test-id",
                    payload = "test-payload",
                )
            val at = OffsetDateTime.now()

            sut.schedule(jobClass::class, message, at)

            val jobDetailSlot = slot<JobDetail>()
            val triggerSlot = slot<Set<Trigger>>()
            verify {
                scheduler.scheduleJob(
                    capture(jobDetailSlot),
                    capture(triggerSlot),
                    true,
                )
            }
            jobDetailSlot.captured.key.name shouldBe message.id
            jobDetailSlot.captured.jobDataMap.getString("id") shouldBe message.id
            jobDetailSlot.captured.jobDataMap.getString("traceId") shouldBe message.traceId
            jobDetailSlot.captured.jobDataMap.getString("payload") shouldBe objectMapper.writeValueAsString(message.payload)
            jobDetailSlot.captured.jobDataMap.getInt("retries") shouldBe message.retries
            triggerSlot.captured
                .first()
                .key.name shouldBe message.id
            triggerSlot.captured
                .first()
                .startTime
                .toInstant()
                .truncatedTo(ChronoUnit.SECONDS) shouldBe
                at.toInstant().truncatedTo(ChronoUnit.SECONDS)
        }

        test("schedule interval") {
            val jobClass = mockk<Job>()
            val message =
                QuartzMessage(
                    id = "test-id",
                    payload = "test-payload",
                )
            val interval = 10.seconds.toJavaDuration()
            val startAt = OffsetDateTime.now()

            sut.schedule(jobClass::class, message, interval, startAt)

            val jobDetailSlot = slot<JobDetail>()
            val triggerSlot = slot<Set<Trigger>>()
            verify {
                scheduler.scheduleJob(
                    capture(jobDetailSlot),
                    capture(triggerSlot),
                    true,
                )
            }
            jobDetailSlot.captured.key.name shouldBe message.id
            jobDetailSlot.captured.jobDataMap.getString("id") shouldBe message.id
            jobDetailSlot.captured.jobDataMap.getString("traceId") shouldBe message.traceId
            jobDetailSlot.captured.jobDataMap.getString("payload") shouldBe objectMapper.writeValueAsString(message.payload)
            jobDetailSlot.captured.jobDataMap.getInt("retries") shouldBe message.retries
            triggerSlot.captured
                .first()
                .key.name shouldBe message.id
            triggerSlot.captured
                .first()
                .startTime
                .toInstant()
                .truncatedTo(ChronoUnit.SECONDS) shouldBe
                startAt.toInstant().truncatedTo(ChronoUnit.SECONDS)
        }

        test("cancel") {
            val jobId = "test-id"
            every { scheduler.checkExists(JobKey.jobKey(jobId)) } returns true

            sut.cancel(jobId)

            verify {
                scheduler.deleteJob(JobKey.jobKey(jobId))
            }
        }
    })
