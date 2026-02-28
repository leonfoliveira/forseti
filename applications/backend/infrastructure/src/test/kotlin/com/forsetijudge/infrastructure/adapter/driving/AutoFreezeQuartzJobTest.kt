package com.forsetijudge.infrastructure.adapter.driving

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.FreezeLeaderboardUseCase
import com.forsetijudge.infrastructure.adapter.driving.job.AutoFreezeQuartzJob
import com.forsetijudge.infrastructure.adapter.dto.quartz.QuartzMessage
import com.forsetijudge.infrastructure.adapter.dto.quartz.payload.AutoFreezeJobPayload
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest(classes = [AutoFreezeQuartzJob::class, JacksonConfig::class])
@ActiveProfiles("test")
class AutoFreezeQuartzJobTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val freezeLeaderboardUseCase: FreezeLeaderboardUseCase,
    private val objectMapper: ObjectMapper,
    private val sut: AutoFreezeQuartzJob,
) : FunSpec({
        test("should execute freezeLeaderboardUseCase when handling payload") {
            val payload = AutoFreezeJobPayload(contestId = IdGenerator.getUUID())
            val message =
                QuartzMessage(
                    id = IdGenerator.getUUID().toString(),
                    traceId = IdGenerator.getTraceId(),
                    payload = payload,
                )

            val dataMap = JobDataMap()
            dataMap.put("id", message.id)
            dataMap.put("traceId", message.traceId)
            dataMap.put("payload", objectMapper.writeValueAsString(message.payload))
            dataMap.put("retries", 0)
            val context = mockk<JobExecutionContext>()
            every { context.mergedJobDataMap } returns dataMap

            sut.executeInternal(context)

            verify { freezeLeaderboardUseCase.execute() }
        }
    })
