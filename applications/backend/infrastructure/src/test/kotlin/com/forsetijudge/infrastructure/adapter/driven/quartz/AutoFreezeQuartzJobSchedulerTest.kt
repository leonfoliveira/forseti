package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.scheduler.payload.AutoFreezeJobPayload
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.verify
import org.quartz.Scheduler
import org.springframework.boot.test.context.SpringBootTest
import java.time.OffsetDateTime
import java.util.Date

@SpringBootTest(classes = [AutoFreezeQuartzJobScheduler::class, JacksonConfig::class])
class AutoFreezeQuartzJobSchedulerTest(
    @MockkBean(relaxed = true)
    private val scheduler: Scheduler,
    private val objectMapper: ObjectMapper,
    private val sut: AutoFreezeQuartzJobScheduler,
) : FunSpec({
        val contestId = IdGenerator.getUUID()
        val traceId = IdGenerator.getTraceId()

        beforeEach {
            ExecutionContext.start(
                contestId = contestId,
                traceId = traceId,
            )
        }

        test("should schedule a job successfully") {
            val payload = AutoFreezeJobPayload(contestId = IdGenerator.getUUID())
            val at = OffsetDateTime.now().plusMinutes(10)

            sut.schedule(id = "test-job-id", payload = payload, at = at)

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
                        trigger.startTime shouldBe Date.from(at.toInstant())
                    },
                )
            }
        }
    })
