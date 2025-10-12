package io.github.leonfoliveira.forseti.api.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.forseti.common.adapter.rabbitmq.message.RabbitMQMessage
import io.github.leonfoliveira.forseti.common.adapter.rabbitmq.message.SubmissionMessagePayload
import io.github.leonfoliveira.forseti.common.config.JacksonConfig
import io.github.leonfoliveira.forseti.common.service.submission.UpdateSubmissionService
import io.kotest.core.spec.style.FunSpec
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
                    SubmissionMessagePayload(
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
