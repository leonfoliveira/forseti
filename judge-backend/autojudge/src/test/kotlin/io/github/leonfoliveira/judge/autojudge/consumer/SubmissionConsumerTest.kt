package io.github.leonfoliveira.judge.autojudge.consumer

import io.github.leonfoliveira.judge.autojudge.feign.ApiClient
import io.github.leonfoliveira.judge.autojudge.service.RunSubmissionService
import io.github.leonfoliveira.judge.autojudge.util.AutoJudgeMetrics
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsMessage
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsSubmissionPayload
import io.github.leonfoliveira.judge.common.domain.entity.Submission
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tags
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import java.util.UUID
import java.util.function.Supplier

class SubmissionConsumerTest : FunSpec({
    val findSubmissionService = mockk<FindSubmissionService>(relaxed = true)
    val runSubmissionService = mockk<RunSubmissionService>(relaxed = true)
    val apiClient = mockk<ApiClient>(relaxed = true)
    val meterRegistry = mockk<MeterRegistry>(relaxed = true)

    val sut =
        SubmissionConsumer(
            findSubmissionService,
            runSubmissionService,
            apiClient,
            meterRegistry,
        )

    beforeEach {
        clearAllMocks()
    }

    test("should call run service") {
        val contestId = UUID.randomUUID()
        val submissionId = UUID.randomUUID()
        val message =
            SqsMessage(
                payload = SqsSubmissionPayload(contestId, submissionId),
            )
        val submission = SubmissionMockBuilder.build(id = submissionId)
        val answer = Submission.Answer.ACCEPTED
        every { findSubmissionService.findById(submissionId) } returns submission
        every { runSubmissionService.run(submission) } returns answer
        val counterMock = mockk<Counter>(relaxed = true)
        every { meterRegistry.counter(any()) } returns counterMock
        every { meterRegistry.counter(any(), any<Tags>()) } returns counterMock
        every {
            meterRegistry.timer(AutoJudgeMetrics.AUTO_JUDGE_SUBMISSION_RUN_TIME)
                .record(any<Supplier<Submission.Answer>>())
        } returns answer

        sut.receiveMessage(message)

        verify { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_RECEIVED_SUBMISSION) }
        val supplierSlot = slot<Supplier<Submission.Answer>>()
        verify {
            meterRegistry.timer(AutoJudgeMetrics.AUTO_JUDGE_SUBMISSION_RUN_TIME).record(capture(supplierSlot))
        }
        supplierSlot.captured.get()
        verify { runSubmissionService.run(submission) }
        verify { apiClient.updateSubmissionAnswer(contestId, submissionId, answer) }
        verify { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_SUCCESSFUL_SUBMISSION, Tags.of("answer", answer.toString())) }
        verify(exactly = 2) { counterMock.increment() }
    }

    test("should count failures") {
        val contestId = UUID.randomUUID()
        val submissionId = UUID.randomUUID()
        val message =
            SqsMessage(
                payload = SqsSubmissionPayload(contestId, submissionId),
            )
        every { findSubmissionService.findById(submissionId) } throws Exception()
        val counterMock = mockk<Counter>(relaxed = true)
        every { meterRegistry.counter(any()) } returns counterMock

        shouldThrow<Exception> {
            sut.receiveMessage(message)
        }

        verify { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_RECEIVED_SUBMISSION) }
        verify { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_FAILED_SUBMISSION) }
        verify(exactly = 2) { counterMock.increment() }
    }
})
