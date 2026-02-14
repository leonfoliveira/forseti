package com.forsetijudge.core.application.service.submission

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import java.time.OffsetDateTime

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
            val submissionId = UuidCreator.getTimeOrderedEpoch()

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
            val contestId = UuidCreator.getTimeOrderedEpoch()

            test("should throw NotFoundException when contest is not found") {
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.findAllByContest(contestId, null)
                }.message shouldBe "Could not find contest with id = $contestId"
            }

            test("should throw ForbiddenException when contest has not started and member is not admin or root") {
                val memberId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT)
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member

                shouldThrow<ForbiddenException> {
                    sut.findAllByContest(contestId, memberId)
                }.message shouldBe "Contest has not started yet"
            }

            test("should return submissions when contest has started") {
                val submission = SubmissionMockBuilder.build()
                val problem = ProblemMockBuilder.build(submissions = listOf(submission))
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1), problems = listOf(problem))
                every { contestRepository.findEntityById(contestId) } returns contest

                val result = sut.findAllByContest(contestId, null)

                result shouldBe listOf(submission).sortedBy { it.createdAt }
            }

            test("should return submissions when contest has not started but member is admin") {
                val memberId = UuidCreator.getTimeOrderedEpoch()
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN)
                val submission = SubmissionMockBuilder.build()
                val problem = ProblemMockBuilder.build(submissions = listOf(submission))
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1), problems = listOf(problem))
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member

                val result = sut.findAllByContest(contestId, memberId)

                result shouldBe listOf(submission).sortedBy { it.createdAt }
            }
        }

        context("findAllByContestSinceLastFreeze") {
            val contestId = UuidCreator.getTimeOrderedEpoch()

            test("should throw NotFoundException when contest is not found") {
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.findAllByContestSinceLastFreeze(contestId)
                }.message shouldBe "Could not find contest with id = $contestId"
            }

            test("should return empty list when no freeze time is found for contest") {
                val contest =
                    ContestMockBuilder.build(
                        autoFreezeAt = null,
                        manualFreezeAt = null,
                    )
                every { contestRepository.findEntityById(contestId) } returns contest

                val result = sut.findAllByContestSinceLastFreeze(contestId)

                result shouldBe listOf()
            }

            test("should return submissions since last freeze when contest is found") {
                val contest =
                    ContestMockBuilder.build(
                        autoFreezeAt = OffsetDateTime.now().minusHours(1),
                    )
                every { contestRepository.findEntityById(contestId) } returns contest
                val submission1 = SubmissionMockBuilder.build(createdAt = OffsetDateTime.now().minusHours(2))
                val submission2 = SubmissionMockBuilder.build(createdAt = OffsetDateTime.now().minusHours(1))
                every { submissionRepository.findAllByCreatedAtGreaterThanEqual(contest.autoFreezeAt!!) } returns
                    listOf(submission1, submission2)

                val result = sut.findAllByContestSinceLastFreeze(contestId)

                result shouldBe listOf(submission1, submission2).sortedBy { it.createdAt }
            }
        }

        context("findAllByMember") {
            val memberId = UuidCreator.getTimeOrderedEpoch()

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
