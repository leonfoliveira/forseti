package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.domain.entity.ExecutionMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.ApiClient
import com.forsetijudge.core.port.driven.SubmissionRunner
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.dto.request.UpdateSubmissionAnswerRequestDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.util.UUID

class JudgeSubmissionServiceTest :
    FunSpec({
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val submissionRunner = mockk<SubmissionRunner>(relaxed = true)
        val apiClient = mockk<ApiClient>(relaxed = true)

        lateinit var sut: JudgeSubmissionService

        beforeEach {
            clearAllMocks()
            sut =
                JudgeSubmissionService(
                    submissionRepository = submissionRepository,
                    submissionRunner = submissionRunner,
                    apiClient = apiClient,
                )
        }

        context("judge") {
            test("should judge submission successfully") {
                val contestId = UUID.randomUUID()
                val submissionId = UUID.randomUUID()
                val submission = SubmissionMockBuilder.build(id = submissionId)
                val expectedAnswer = Submission.Answer.ACCEPTED
                val execution = ExecutionMockBuilder.build(answer = expectedAnswer)

                every { submissionRepository.findEntityById(submissionId) } returns submission
                every { submissionRunner.run(submission) } returns execution

                sut.judge(contestId, submissionId)

                verify { submissionRepository.findEntityById(submissionId) }
                verify { submissionRunner.run(submission) }
                verify { apiClient.updateSubmissionAnswer(contestId, submissionId, UpdateSubmissionAnswerRequestDTO(expectedAnswer)) }
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

                every { submissionRepository.findEntityById(submissionId) } returns submission
                every { submissionRunner.run(submission) } throws RuntimeException("Docker error")

                shouldThrow<RuntimeException> {
                    sut.judge(contestId, submissionId)
                }

                verify { submissionRepository.findEntityById(submissionId) }
                verify { submissionRunner.run(submission) }
            }
        }
    })
