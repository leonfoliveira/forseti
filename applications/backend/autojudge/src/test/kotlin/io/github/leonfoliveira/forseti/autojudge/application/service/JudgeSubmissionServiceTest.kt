package io.github.leonfoliveira.forseti.autojudge.application.service

import io.github.leonfoliveira.forseti.autojudge.application.port.driven.ApiClient
import io.github.leonfoliveira.forseti.autojudge.application.port.driven.SubmissionRunner
import io.github.leonfoliveira.forseti.autojudge.application.util.AutoJudgeMetrics
import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.SubmissionRepository
import io.github.leonfoliveira.forseti.common.mock.entity.ExecutionMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.SubmissionMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tags
import io.micrometer.core.instrument.Timer
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.UUID
import java.util.function.Supplier

class JudgeSubmissionServiceTest :
    FunSpec({
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val submissionRunner = mockk<SubmissionRunner>(relaxed = true)
        val apiClient = mockk<ApiClient>(relaxed = true)
        val meterRegistry = mockk<MeterRegistry>(relaxed = true)

        lateinit var sut: JudgeSubmissionService

        beforeEach {
            clearAllMocks()
            sut =
                JudgeSubmissionService(
                    submissionRepository = submissionRepository,
                    submissionRunner = submissionRunner,
                    apiClient = apiClient,
                    meterRegistry = meterRegistry,
                )
        }

        context("judge") {
            test("should judge submission successfully") {
                val contestId = UUID.randomUUID()
                val submissionId = UUID.randomUUID()
                val submission = SubmissionMockBuilder.build(id = submissionId)
                val expectedAnswer = Submission.Answer.ACCEPTED
                val execution = ExecutionMockBuilder.build(answer = expectedAnswer)

                val receivedCounter = mockk<Counter>(relaxed = true)
                val successCounter = mockk<Counter>(relaxed = true)
                val timer = mockk<Timer>(relaxed = true)

                every { submissionRepository.findEntityById(submissionId) } returns submission
                every { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_RECEIVED_SUBMISSION) } returns receivedCounter
                every { meterRegistry.timer(AutoJudgeMetrics.AUTO_JUDGE_SUBMISSION_RUN_TIME) } returns timer
                every { timer.record(any<Supplier<*>>()) } answers {
                    val supplier = firstArg<Supplier<*>>()
                    supplier.get()
                }
                every { submissionRunner.run(submission) } returns execution
                every {
                    meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_SUCCESSFUL_SUBMISSION, Tags.of("answer", expectedAnswer.toString()))
                } returns successCounter

                sut.judge(contestId, submissionId)

                verify { submissionRepository.findEntityById(submissionId) }
                verify { receivedCounter.increment() }
                verify { submissionRunner.run(submission) }
                verify { successCounter.increment() }
                verify { apiClient.updateSubmissionAnswer(contestId, submissionId, expectedAnswer) }
            }

            test("should throw NotFoundException when submission not found") {
                val contestId = UUID.randomUUID()
                val submissionId = UUID.randomUUID()

                every { submissionRepository.findEntityById(submissionId) } returns null

                shouldThrow<NotFoundException> {
                    sut.judge(contestId, submissionId)
                }

                verify { submissionRepository.findEntityById(submissionId) }
            }

            test("should track failure metrics when docker runner fails") {
                val contestId = UUID.randomUUID()
                val submissionId = UUID.randomUUID()
                val submission = SubmissionMockBuilder.build(id = submissionId)

                val receivedCounter = mockk<Counter>(relaxed = true)
                val failedCounter = mockk<Counter>(relaxed = true)
                val timer = mockk<Timer>(relaxed = true)

                every { submissionRepository.findEntityById(submissionId) } returns submission
                every { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_RECEIVED_SUBMISSION) } returns receivedCounter
                every { meterRegistry.timer(AutoJudgeMetrics.AUTO_JUDGE_SUBMISSION_RUN_TIME) } returns timer
                every { timer.record(any<Supplier<*>>()) } answers {
                    val supplier = firstArg<Supplier<*>>()
                    supplier.get()
                }
                every { submissionRunner.run(submission) } throws RuntimeException("Docker error")
                every { meterRegistry.counter(AutoJudgeMetrics.AUTO_JUDGE_FAILED_SUBMISSION) } returns failedCounter

                shouldThrow<RuntimeException> {
                    sut.judge(contestId, submissionId)
                }

                verify { submissionRepository.findEntityById(submissionId) }
                verify { receivedCounter.increment() }
                verify { submissionRunner.run(submission) }
                verify { failedCounter.increment() }
            }
        }
    })
