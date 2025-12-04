package com.forsetijudge.api.adapter.driving.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driving.usecase.session.RefreshSessionUseCase
import com.forsetijudge.core.port.driving.usecase.submission.UpdateSubmissionUseCase
import com.forsetijudge.infrastructure.adapter.dto.message.RabbitMQMessage
import com.forsetijudge.infrastructure.adapter.dto.message.payload.SubmissionMessagePayload
import com.ninjasquad.springmockk.MockkBean
import io.kotest.core.spec.style.FunSpec
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import java.util.UUID

@SpringBootTest(classes = [FailedSubmissionRabbitMQConsumer::class, JacksonConfig::class])
class FailedSubmissionRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val refreshSessionUseCase: RefreshSessionUseCase,
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
