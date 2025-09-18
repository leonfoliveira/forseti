package io.github.leonfoliveira.judge.api.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.message.RabbitMQMessage
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.message.SubmissionQueuePayload
import io.github.leonfoliveira.judge.common.config.JacksonConfig
import io.github.leonfoliveira.judge.common.service.submission.UpdateSubmissionService
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import java.util.UUID

@SpringBootTest(classes = [FailedSubmissionRabbitMQConsumer::class, JacksonConfig::class])
class FailedSubmissionRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val updateSubmissionService: UpdateSubmissionService,
    private val objectMapper: ObjectMapper,
    private val sut: FailedSubmissionRabbitMQConsumer,
) : FunSpec({
        val event =
            RabbitMQMessage(
                payload =
                    SubmissionQueuePayload(
                        submissionId = UUID.randomUUID(),
                        contestId = UUID.randomUUID(),
                    ),
            )
        val jsonEvent = objectMapper.writeValueAsString(event)

        test("should handle payload") {
            sut.receiveMessage(jsonEvent)

            verify { updateSubmissionService.fail(event.payload.submissionId) }
        }
    })
