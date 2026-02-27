package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.job.payload.AttachmentBucketCleanerJobPayload
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.verify
import org.quartz.Scheduler
import org.springframework.boot.test.context.SpringBootTest
import java.time.OffsetDateTime
import java.util.Date
import kotlin.time.Duration.Companion.minutes
import kotlin.time.toJavaDuration

@SpringBootTest(classes = [AttachmentBucketCleanerQuartzJobScheduler::class, JacksonConfig::class])
class AttachmentBucketCleanerQuartzJobSchedulerTest(
    @MockkBean(relaxed = true)
    private val scheduler: Scheduler,
    private val objectMapper: ObjectMapper,
    private val sut: AttachmentBucketCleanerQuartzJobScheduler,
) : FunSpec({
        val traceId = IdGenerator.getTraceId()

        beforeEach {
            ExecutionContext.start(
                contestId = null,
                traceId = traceId,
            )
        }

        test("should schedule a job successfully") {
            val payload = AttachmentBucketCleanerJobPayload()
            val startAt = OffsetDateTime.now().plusMinutes(10)
            val interval = 10.minutes.toJavaDuration()

            sut.schedule(
                id = "test-job-id",
                payload = payload,
                startAt = startAt,
                interval = interval,
            )

            verify {
                scheduler.scheduleJob(
                    withArg { jobDetail ->
                        jobDetail.key.name shouldBe "test-job-id"
                        jobDetail.jobDataMap["id"] shouldBe "test-job-id"
                        jobDetail.jobDataMap["traceId"] shouldBe traceId
                        jobDetail.jobDataMap["payload"] shouldBe objectMapper.writeValueAsString(payload)
                        jobDetail.jobDataMap["retries"] shouldBe 0
                    },
                    withArg { trigger ->
                        trigger.startTime shouldBe Date.from(startAt.toInstant())
                    },
                )
            }
        }
    })
