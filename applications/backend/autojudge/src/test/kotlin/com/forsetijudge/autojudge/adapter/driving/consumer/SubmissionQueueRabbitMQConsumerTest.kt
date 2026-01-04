package com.forsetijudge.autojudge.adapter.driving.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.core.port.driving.usecase.session.RefreshSessionUseCase
import com.forsetijudge.core.port.driving.usecase.submission.JudgeSubmissionUseCase
import com.forsetijudge.infrastructure.adapter.dto.message.RabbitMQMessage
import com.forsetijudge.infrastructure.adapter.dto.message.payload.SubmissionMessagePayload
import com.github.f4b6a3.uuid.UuidCreator
import com.ninjasquad.springmockk.MockkBean
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(classes = [SubmissionQueueRabbitMQConsumer::class, JacksonConfig::class])
class SubmissionQueueRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    private val refreshSessionUseCase: RefreshSessionUseCase,
    @MockkBean(relaxed = true)
    private val judgeSubmissionUseCase: JudgeSubmissionUseCase,
    private val objectMapper: ObjectMapper,
    private val sut: SubmissionQueueRabbitMQConsumer,
) : FunSpec({
        test("should process payload successfully") {
            val message =
                RabbitMQMessage(
                    id = UuidCreator.getTimeOrderedEpoch(),
                    payload =
                        SubmissionMessagePayload(
                            submissionId = UuidCreator.getTimeOrderedEpoch(),
                            contestId = UuidCreator.getTimeOrderedEpoch(),
                        ),
                )
            val jsonMessage = objectMapper.writeValueAsString(message)

            sut.receiveMessage(jsonMessage)

            verify { judgeSubmissionUseCase.judge(message.payload.contestId, message.payload.submissionId) }
        }

        test("should propagate exceptions from judge service") {
            val message =
                RabbitMQMessage(
                    id = UuidCreator.getTimeOrderedEpoch(),
                    payload =
                        SubmissionMessagePayload(
                            submissionId = UuidCreator.getTimeOrderedEpoch(),
                            contestId = UuidCreator.getTimeOrderedEpoch(),
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
