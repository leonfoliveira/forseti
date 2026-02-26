package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driven.queue.payload.SubmissionQueuePayload
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.external.submission.FailSubmissionUseCase
import com.forsetijudge.infrastructure.adapter.dto.message.RabbitMQMessage
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(classes = [FailedSubmissionRabbitMQConsumer::class, JacksonConfig::class])
class FailedSubmissionRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val authenticateSystemUseCase: AuthenticateSystemUseCase,
    @MockkBean(relaxed = true)
    private val failSubmissionUseCase: FailSubmissionUseCase,
    private val objectMapper: ObjectMapper,
    private val sut: FailedSubmissionRabbitMQConsumer,
) : FunSpec({
        val contestId = IdGenerator.getUUID()

        val message =
            RabbitMQMessage(
                id = IdGenerator.getUUID(),
                contestId = contestId,
                traceId = IdGenerator.getTraceId(),
                payload =
                    SubmissionQueuePayload(
                        submissionId = IdGenerator.getUUID(),
                    ),
            )
        val jsonMessage = objectMapper.writeValueAsString(message)

        test("should handle payload") {
            sut.receiveMessage(jsonMessage)

            verify {
                failSubmissionUseCase.execute(
                    FailSubmissionUseCase.Command(
                        submissionId = message.payload.submissionId,
                    ),
                )
            }
        }
    })
