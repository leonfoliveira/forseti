package io.github.leonfoliveira.forseti.autojudge.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.autojudge.service.JudgeSubmissionService
import io.github.leonfoliveira.forseti.common.adapter.rabbitmq.message.RabbitMQMessage
import io.github.leonfoliveira.forseti.common.adapter.rabbitmq.message.SubmissionMessagePayload
import io.github.leonfoliveira.forseti.common.config.JacksonConfig
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import java.util.UUID

@SpringBootTest(classes = [SubmissionQueueRabbitMQConsumer::class, JacksonConfig::class])
class SubmissionQueueRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    val judgeSubmissionService: JudgeSubmissionService,
    val objectMapper: ObjectMapper,
    val sut: SubmissionQueueRabbitMQConsumer,
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

            verify { judgeSubmissionService.judge(message.payload.contestId, message.payload.submissionId) }
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

            every { judgeSubmissionService.judge(message.payload.contestId, message.payload.submissionId) } throws
                RuntimeException("Test exception")

            shouldThrow<RuntimeException> {
                sut.receiveMessage(jsonMessage)
            }

            verify { judgeSubmissionService.judge(message.payload.contestId, message.payload.submissionId) }
        }
    })
