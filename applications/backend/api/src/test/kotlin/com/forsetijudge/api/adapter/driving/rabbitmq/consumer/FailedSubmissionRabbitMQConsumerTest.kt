package com.forsetijudge.api.adapter.driving.rabbitmq.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driving.usecase.external.authentication.AuthenticateSystemUseCase
import com.forsetijudge.core.port.driving.usecase.external.submission.FailSubmissionUseCase
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.SubmissionQueueMessageBody
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.amqp.core.Message
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
        val message = mockk<Message>(relaxed = true)
        val submissionId = IdGenerator.getUUID()
        every { message.messageProperties.headers } returns mapOf("id" to IdGenerator.getUUID().toString())
        every { message.body } returns
            objectMapper.writeValueAsBytes(
                SubmissionQueueMessageBody(
                    submissionId = submissionId,
                ),
            )

        test("should handle payload") {
            sut.receiveMessage(message)

            verify {
                failSubmissionUseCase.execute(
                    FailSubmissionUseCase.Command(
                        submissionId = submissionId,
                    ),
                )
            }
        }
    })
