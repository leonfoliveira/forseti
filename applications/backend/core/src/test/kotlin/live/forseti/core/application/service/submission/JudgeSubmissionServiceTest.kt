package live.forseti.core.application.service.submission

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import live.forseti.core.domain.entity.ExecutionMockBuilder
import live.forseti.core.domain.entity.Submission
import live.forseti.core.domain.entity.SubmissionMockBuilder
import live.forseti.core.domain.exception.NotFoundException
import live.forseti.core.port.driven.ApiClient
import live.forseti.core.port.driven.SubmissionRunner
import live.forseti.core.port.driven.repository.SubmissionRepository
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
