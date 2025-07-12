package io.github.leonfoliveira.judge.common.service.submission

import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.SubmissionMockBuilder
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.repository.SubmissionRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime
import java.util.Optional
import java.util.UUID

class FindSubmissionServiceTest : FunSpec({
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
            every { submissionRepository.findById(submissionId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.findById(submissionId)
            }.message shouldBe "Could not find submission with id = $submissionId"
        }

        test("should return submission when found") {
            val submission = SubmissionMockBuilder.build()
            every { submissionRepository.findById(submissionId) } returns Optional.of(submission)

            val result = sut.findById(submissionId)

            result shouldBe submission
        }
    }

    context("findAllByContest") {
        val contestId = UUID.randomUUID()

        test("should throw NotFoundException when contest is not found") {
            every { contestRepository.findById(contestId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.findAllByContest(contestId)
            }.message shouldBe "Could not find contest with id = $contestId"
        }

        test("should throw ForbiddenException when contest has not started") {
            val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
            every { contestRepository.findById(contestId) } returns Optional.of(contest)

            shouldThrow<ForbiddenException> {
                sut.findAllByContest(contestId)
            }.message shouldBe "Contest has not started yet"
        }

        test("should return submissions when contest has started") {
            val submission = SubmissionMockBuilder.build()
            val member = MemberMockBuilder.build(submissions = listOf(submission))
            val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1), members = listOf(member))
            every { contestRepository.findById(contestId) } returns Optional.of(contest)

            val result = sut.findAllByContest(contestId)

            result shouldBe listOf(submission).sortedBy { it.createdAt }
        }
    }

    context("findAllByMember") {
        val memberId = UUID.randomUUID()

        test("should throw NotFoundException when member is not found") {
            every { memberRepository.findById(memberId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.findAllByMember(memberId)
            }.message shouldBe "Could not find member with id = $memberId"
        }

        test("should return submissions when member is found") {
            val submission = SubmissionMockBuilder.build()
            val member = MemberMockBuilder.build(submissions = listOf(submission))
            every { memberRepository.findById(memberId) } returns Optional.of(member)

            val result = sut.findAllByMember(memberId)

            result shouldBe listOf(submission).sortedBy { it.createdAt }
        }
    }
})
