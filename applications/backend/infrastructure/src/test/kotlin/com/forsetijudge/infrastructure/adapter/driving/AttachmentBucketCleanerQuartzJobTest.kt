package com.forsetijudge.infrastructure.adapter.driving

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driven.job.payload.AttachmentBucketCleanerJobPayload
import com.forsetijudge.core.port.driving.usecase.external.attachment.CleanUncommitedAttachmentsUseCase
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.infrastructure.adapter.driving.job.AttachmentBucketCleanerQuartzJob
import com.forsetijudge.infrastructure.adapter.dto.job.QuartzMessage
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest(classes = [AttachmentBucketCleanerQuartzJob::class, JacksonConfig::class])
@ActiveProfiles("test")
class AttachmentBucketCleanerQuartzJobTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val cleanAttachmentBucketUseCase: CleanUncommitedAttachmentsUseCase,
    private val objectMapper: ObjectMapper,
    private val sut: AttachmentBucketCleanerQuartzJob,
) : FunSpec({
        test("should execute cleanAttachmentBucketUseCase when handling payload") {
            val payload = AttachmentBucketCleanerJobPayload()
            val message =
                QuartzMessage(
                    id = IdGenerator.getUUID().toString(),
                    contestId = null,
                    traceId = IdGenerator.getTraceId(),
                    payload = payload,
                )

            val dataMap = JobDataMap()
            dataMap.put("id", message.id)
            dataMap.put("contestId", null)
            dataMap.put("traceId", message.traceId)
            dataMap.put("payload", objectMapper.writeValueAsString(message.payload))
            dataMap.put("retries", 0)
            val context = mockk<JobExecutionContext>()
            every { context.mergedJobDataMap } returns dataMap

            sut.executeInternal(context)

            verify { cleanAttachmentBucketUseCase.execute() }
        }
    })
