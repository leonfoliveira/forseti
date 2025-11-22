package live.forseti.api.adapter.driving.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.verify
import live.forseti.core.config.JacksonConfig
import live.forseti.core.port.driving.usecase.submission.UpdateSubmissionUseCase
import live.forseti.infrastructure.adapter.dto.message.RabbitMQMessage
import live.forseti.infrastructure.adapter.dto.message.payload.SubmissionMessagePayload
import org.springframework.boot.test.context.SpringBootTest
import java.util.UUID

@SpringBootTest(classes = [FailedSubmissionRabbitMQConsumer::class, JacksonConfig::class])
class FailedSubmissionRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val updateSubmissionUseCase: UpdateSubmissionUseCase,
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

            verify { updateSubmissionUseCase.fail(event.payload.submissionId) }
        }
    })
