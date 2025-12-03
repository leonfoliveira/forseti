package com.forsetijudge.core.application.service.execution

import com.forsetijudge.core.application.service.attachment.UploadAttachmentService
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.port.driven.repository.ExecutionRepository
import com.forsetijudge.core.port.dto.input.execution.CreateExecutionInputDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class CreateExecutionServiceTest :
    FunSpec({
        val executionRepository = mockk<ExecutionRepository>(relaxed = true)
        val uploadAttachmentService = mockk<UploadAttachmentService>(relaxed = true)

        val sut =
            CreateExecutionService(
                executionRepository = executionRepository,
                uploadAttachmentService = uploadAttachmentService,
            )

        val attachment = AttachmentMockBuilder.build()

        beforeEach {
            every { executionRepository.save(any()) } answers { firstArg() }
            every { uploadAttachmentService.upload(any(), any(), any(), any(), any(), any()) } answers { attachment }
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
