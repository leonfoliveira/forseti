package io.github.leonfoliveira.judge.autojudge.consumer

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.github.leonfoliveira.judge.autojudge.service.RunSubmissionService
import io.github.leonfoliveira.judge.autojudge.util.AutoJudgeMetrics
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.message.RabbitMQMessage
import io.github.leonfoliveira.judge.common.adapter.rabbitmq.message.SubmissionMessagePayload
import io.github.leonfoliveira.judge.common.config.JacksonConfig
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tags
import io.micrometer.core.instrument.Timer
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.ApplicationEventPublisher
import java.util.UUID
import java.util.function.Supplier

@SpringBootTest(classes = [SubmissionQueueRabbitMQConsumer::class, JacksonConfig::class])
class SubmissionQueueRabbitMQConsumerTest(
    @MockkBean(relaxed = true)
    val findSubmissionService: FindSubmissionService,
    @MockkBean(relaxed = true)
    val runSubmissionService: RunSubmissionService,
    @MockkBean(relaxed = true)
    val applicationEventPublisher: ApplicationEventPublisher,
    @MockkBean(relaxed = true)
    val meterRegistry: MeterRegistry,
    val objectMapper: ObjectMapper,
    val sut: SubmissionQueueRabbitMQConsumer,
) : FunSpec({
        test("should process payload successfully") {
            val receivedSubmissionCounter = mockk<Counter>(relaxed = true)
            every { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_RECEIVED_SUBMISSION) } returns receivedSubmissionCounter
            val successfulSubmissionCounter = mockk<Counter>(relaxed = true)
            every { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_SUCCESSFUL_SUBMISSION, any<Tags>()) } returns
                successfulSubmissionCounter
            val failedSubmissionCounter = mockk<Counter>(relaxed = true)
            every { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_FAILED_SUBMISSION) } returns failedSubmissionCounter

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

            val submission = SubmissionMockBuilder.build()
            every { findSubmissionService.findById(message.payload.submissionId) } returns submission

            val answer = Submission.Answer.ACCEPTED
            val submissionRunTimeTimer = mockk<Timer>()
            every { meterRegistry.timer(AutoJudgeMetrics.AUTO_JUDGE_SUBMISSION_RUN_TIME) } returns submissionRunTimeTimer
            every { submissionRunTimeTimer.record(any(Supplier::class)) } returns answer

            sut.receiveMessage(jsonMessage)

            verify { receivedSubmissionCounter.increment() }
            verify { findSubmissionService.findById(message.payload.submissionId) }
            val supplierSlot = slot<Supplier<Submission.Answer>>()
            verify { submissionRunTimeTimer.record(capture(supplierSlot)) }
            supplierSlot.captured.get()
            verify { runSubmissionService.run(submission) }
            verify { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_SUCCESSFUL_SUBMISSION, Tags.of("answer", answer.toString())) }
            verify { successfulSubmissionCounter.increment() }
        }

        test("should collect failure metrics") {
            val receivedSubmissionCounter = mockk<Counter>(relaxed = true)
            every { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_RECEIVED_SUBMISSION) } returns receivedSubmissionCounter
            val failedSubmissionCounter = mockk<Counter>(relaxed = true)
            every { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_FAILED_SUBMISSION) } returns failedSubmissionCounter

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

            every { findSubmissionService.findById(message.payload.submissionId) } throws RuntimeException("Test exception")

            shouldThrow<RuntimeException> {
                sut.receiveMessage(jsonMessage)
            }

            verify { receivedSubmissionCounter.increment() }
            verify { findSubmissionService.findById(message.payload.submissionId) }
            verify { failedSubmissionCounter.increment() }
        }
    })
