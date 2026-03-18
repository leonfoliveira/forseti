package com.forsetijudge.core.application.service.internal.execution

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
import com.forsetijudge.core.port.driving.usecase.internal.execution.CreateExecutionInternalUseCase
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher

class CreateExecutionInternalServiceTest :
    FunSpec({
        val executionRepository = mockk<ExecutionRepository>(relaxed = true)
        val uploadAttachmentInternalUseCase = mockk<UploadAttachmentInternalUseCase>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            CreateExecutionInternalService(
                executionRepository = executionRepository,
                uploadAttachmentInternalUseCase = uploadAttachmentInternalUseCase,
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
                every { uploadAttachmentInternalUseCase.execute(any()) } answers { Pair(attachment, ByteArray(0)) }
                val command =
                    CreateExecutionInternalUseCase.Command(
                        contest = ContestMockBuilder.build(),
                        member = MemberMockBuilder.build(),
                        submission = SubmissionMockBuilder.build(),
                        answer = Submission.Answer.ACCEPTED,
                        totalTestCases = 10,
                        approvedTestCases = 10,
                        results =
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
                            ),
                    )

                val execution = sut.execute(command)

                execution.answer shouldBe command.answer
                execution.totalTestCases shouldBe command.totalTestCases
                execution.approvedTestCases shouldBe command.approvedTestCases
                verify { executionRepository.save(execution) }
                verify { applicationEventPublisher.publishEvent(match<ExecutionEvent.Created> { it.executionId == execution.id }) }
            }

            test("should create execution without result") {
                every { executionRepository.save(any()) } answers { firstArg() }
                every { uploadAttachmentInternalUseCase.execute(any()) } answers { Pair(attachment, ByteArray(0)) }
                val command =
                    CreateExecutionInternalUseCase.Command(
                        contest = ContestMockBuilder.build(),
                        member = MemberMockBuilder.build(),
                        submission = SubmissionMockBuilder.build(),
                        answer = Submission.Answer.ACCEPTED,
                        totalTestCases = 10,
                        approvedTestCases = 0,
                        results = emptyList(),
                    )

                val execution = sut.execute(command)

                execution.answer shouldBe command.answer
                execution.totalTestCases shouldBe command.totalTestCases
                execution.approvedTestCases shouldBe command.approvedTestCases
                verify { executionRepository.save(execution) }
                verify { applicationEventPublisher.publishEvent(match<ExecutionEvent.Created> { it.executionId == execution.id }) }
            }
        }
    })
