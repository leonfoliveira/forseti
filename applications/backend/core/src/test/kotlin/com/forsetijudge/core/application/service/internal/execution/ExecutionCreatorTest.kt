package com.forsetijudge.core.application.service.internal.execution

import com.forsetijudge.core.application.service.internal.attachment.AttachmentUploader
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.event.ExecutionEvent
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.domain.model.TestCaseExecutionResult
import com.forsetijudge.core.port.driven.repository.ExecutionRepository
import com.forsetijudge.core.port.driving.usecase.internal.attachment.UploadAttachmentInternalUseCase
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher

class ExecutionCreatorTest :
    FunSpec({
        val executionRepository = mockk<ExecutionRepository>(relaxed = true)
        val attachmentUploader = mockk<AttachmentUploader>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            ExecutionCreator(
                executionRepository = executionRepository,
                attachmentUploader = attachmentUploader,
                applicationEventPublisher = applicationEventPublisher,
            )

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build()
        }

        val attachment = AttachmentMockBuilder.build(isCommited = false)

        context("create") {
            test("should create execution") {
                every { executionRepository.save(any()) } answers { firstArg() }
                every { attachmentUploader.upload(any(), any(), any(), any(), any(), any()) } answers { Pair(attachment, ByteArray(0)) }
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                val submission = SubmissionMockBuilder.build()
                val answer = Submission.Answer.ACCEPTED
                val totalTestCases = 10
                val approvedTestCases = 10
                val results =
                    listOf(
                        TestCaseExecutionResult(
                            answer = Submission.Answer.ACCEPTED,
                            exitCode = 0,
                            cpuTime = 100,
                            clockTime = 150,
                            peakMemory = 1024,
                            stdin = "input",
                            stdout = "output",
                            stderr = null,
                        ),
                    )

                val execution =
                    sut.create(
                        contest = contest,
                        member = member,
                        submission = submission,
                        answer = answer,
                        totalTestCases = totalTestCases,
                        approvedTestCases = approvedTestCases,
                        results = results,
                    )

                execution.answer shouldBe answer
                execution.totalTestCases shouldBe totalTestCases
                execution.approvedTestCases shouldBe approvedTestCases
                verify { executionRepository.save(execution) }
                verify { applicationEventPublisher.publishEvent(match<ExecutionEvent.Created> { it.executionId == execution.id }) }
            }

            test("should create execution without result") {
                every { executionRepository.save(any()) } answers { firstArg() }
                every { attachmentUploader.upload(any(), any(), any(), any(), any(), any()) } answers { Pair(attachment, ByteArray(0)) }
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build()
                val submission = SubmissionMockBuilder.build()
                val answer = Submission.Answer.ACCEPTED
                val totalTestCases = 10
                val approvedTestCases = 0
                val results = emptyList<TestCaseExecutionResult>()

                val execution =
                    sut.create(
                        contest = contest,
                        member = member,
                        submission = submission,
                        answer = answer,
                        totalTestCases = totalTestCases,
                        approvedTestCases = approvedTestCases,
                        results = results,
                    )

                execution.answer shouldBe answer
                execution.totalTestCases shouldBe totalTestCases
                execution.approvedTestCases shouldBe approvedTestCases
                verify { executionRepository.save(execution) }
                verify { applicationEventPublisher.publishEvent(match<ExecutionEvent.Created> { it.executionId == execution.id }) }
            }
        }
    })
