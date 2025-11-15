package io.github.leonfoliveira.forseti.common.application.service.submission

import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ContestRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.MemberRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.SubmissionRepository
import io.github.leonfoliveira.forseti.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.ProblemMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.SubmissionMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime
import java.util.UUID

class FindSubmissionServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)

        val sut =
            FindSubmissionService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                submissionRepository = submissionRepository,
            )

        beforeEach {
            clearAllMocks()
        }

        context("findById") {
            val submissionId = UUID.randomUUID()

            test("should throw NotFoundException when submission is not found") {
                every { submissionRepository.findEntityById(submissionId) } returns null

                shouldThrow<NotFoundException> {
                    sut.findById(submissionId)
                }.message shouldBe "Could not find submission with id = $submissionId"
            }

            test("should return submission when found") {
                val submission = SubmissionMockBuilder.build()
                every { submissionRepository.findEntityById(submissionId) } returns submission

                val result = sut.findById(submissionId)

                result shouldBe submission
            }
        }

        context("findAllByContest") {
            val contestId = UUID.randomUUID()

            test("should throw NotFoundException when contest is not found") {
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.findAllByContest(contestId)
                }.message shouldBe "Could not find contest with id = $contestId"
            }

            test("should return submissions") {
                val submission = SubmissionMockBuilder.build()
                val problem = ProblemMockBuilder.build(submissions = listOf(submission))
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1), problems = listOf(problem))
                every { contestRepository.findEntityById(contestId) } returns contest

                val result = sut.findAllByContest(contestId)

                result shouldBe listOf(submission).sortedBy { it.createdAt }
            }
        }

        context("findAllByMember") {
            val memberId = UUID.randomUUID()

            test("should throw NotFoundException when member is not found") {
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> {
                    sut.findAllByMember(memberId)
                }.message shouldBe "Could not find member with id = $memberId"
            }

            test("should return submissions when member is found") {
                val submission = SubmissionMockBuilder.build()
                val member = MemberMockBuilder.build(submissions = listOf(submission))
                every { memberRepository.findEntityById(memberId) } returns member

                val result = sut.findAllByMember(memberId)

                result shouldBe listOf(submission).sortedBy { it.createdAt }
            }
        }
    })
