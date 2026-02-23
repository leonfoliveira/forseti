package com.forsetijudge.autojudge.adapter.driving.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.application.util.SessionCache
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.port.driven.producer.payload.SubmissionQueuePayload
import com.forsetijudge.core.port.driving.usecase.external.submission.AutoJudgeSubmissionUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import com.forsetijudge.infrastructure.adapter.dto.message.RabbitMQMessage
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(classes = [SubmissionQueueRabbitMQConsumer::class, JacksonConfig::class])
class SubmissionQueueRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val sessionCache: SessionCache,
    @MockkBean(relaxed = true)
    private val autoJudgeSubmissionUseCase: AutoJudgeSubmissionUseCase,
    private val objectMapper: ObjectMapper,
    private val sut: SubmissionQueueRabbitMQConsumer,
) : FunSpec({
        beforeEach {
            every { sessionCache.get(any(), any()) } returns SessionMockBuilder.build().toResponseBodyDTO()
        }

        test("should process payload successfully") {
            val message =
                RabbitMQMessage(
                    id = IdGenerator.getUUID(),
                    contestId = IdGenerator.getUUID(),
                    traceId = IdGenerator.getTraceId(),
                    payload =
                        SubmissionQueuePayload(
                            submissionId = IdGenerator.getUUID(),
                        ),
                )
            val jsonMessage = objectMapper.writeValueAsString(message)

            sut.receiveMessage(jsonMessage)

            verify {
                autoJudgeSubmissionUseCase.execute(
                    AutoJudgeSubmissionUseCase.Command(
                        submissionId = message.payload.submissionId,
                    ),
                )
            }
        }
    })
