package io.github.leonfoliveira.forseti.autojudge.application.service

import io.github.leonfoliveira.forseti.autojudge.application.dto.input.CreateExecutionInputDTO
import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ExecutionRepository
import io.github.leonfoliveira.forseti.common.application.service.attachment.AttachmentService
import io.github.leonfoliveira.forseti.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.SubmissionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class CreateExecutionServiceTest :
    FunSpec({
        val executionRepository = mockk<ExecutionRepository>(relaxed = true)
        val attachmentService = mockk<AttachmentService>(relaxed = true)

        val sut =
            CreateExecutionService(
                executionRepository = executionRepository,
                attachmentService = attachmentService,
            )

        val attachment = AttachmentMockBuilder.build()

        beforeEach {
            every { executionRepository.save(any()) } answers { firstArg() }
            every { attachmentService.upload(any(), any(), any(), any(), any(), any()) } answers { attachment }
        }

        context("create") {
            test("should create execution") {
                val inputDTO =
                    CreateExecutionInputDTO(
                        submission = SubmissionMockBuilder.build(),
                        answer = Submission.Answer.ACCEPTED,
                        totalTestCases = 10,
                        lastTestCase = 9,
                        input = AttachmentMockBuilder.build(),
                        output = listOf("output1", "output2", "output3"),
                    )

                val execution = sut.create(inputDTO)

                execution.answer shouldBe inputDTO.answer
                execution.totalTestCases shouldBe inputDTO.totalTestCases
                execution.lastTestCase shouldBe inputDTO.lastTestCase
                execution.input shouldBe inputDTO.input
                execution.output shouldBe attachment
                verify { executionRepository.save(execution) }
            }
        }
    })
