package io.github.leonfoliveira.forseti.autojudge.adapter.driving.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.autojudge.application.port.driving.JudgeSubmissionUseCase
import io.github.leonfoliveira.forseti.common.adapter.config.JacksonConfig
import io.github.leonfoliveira.forseti.common.adapter.driven.rabbitmq.message.RabbitMQMessage
import io.github.leonfoliveira.forseti.common.adapter.driven.rabbitmq.message.SubmissionMessagePayload
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import java.util.UUID

@SpringBootTest(classes = [SubmissionQueueRabbitMQConsumer::class, JacksonConfig::class])
class SubmissionQueueRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val judgeSubmissionUseCase: JudgeSubmissionUseCase,
    private val objectMapper: ObjectMapper,
    private val sut: SubmissionQueueRabbitMQConsumer,
) : FunSpec({
        test("should process payload successfully") {
            val message =
                RabbitMQMessage(
                    id = UUID.randomUUID(),
                    payload =
                        SubmissionMessagePayload(
                            submissionId = UUID.randomUUID(),
                            contestId = UUID.randomUUID(),
                        ),
                )
            val jsonMessage = objectMapper.writeValueAsString(message)

            sut.receiveMessage(jsonMessage)

            verify { judgeSubmissionUseCase.judge(message.payload.contestId, message.payload.submissionId) }
        }

        test("should propagate exceptions from judge service") {
            val message =
                RabbitMQMessage(
                    id = UUID.randomUUID(),
                    payload =
                        SubmissionMessagePayload(
                            submissionId = UUID.randomUUID(),
                            contestId = UUID.randomUUID(),
                        ),
                )
            val jsonMessage = objectMapper.writeValueAsString(message)

            every { judgeSubmissionUseCase.judge(message.payload.contestId, message.payload.submissionId) } throws
                RuntimeException("Test exception")

            shouldThrow<RuntimeException> {
                sut.receiveMessage(jsonMessage)
            }

            verify { judgeSubmissionUseCase.judge(message.payload.contestId, message.payload.submissionId) }
        }
    })
