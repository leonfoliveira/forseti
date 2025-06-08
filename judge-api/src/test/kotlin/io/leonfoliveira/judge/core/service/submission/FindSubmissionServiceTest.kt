package io.leonfoliveira.judge.core.service.submission

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.MemberMockFactory
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.MemberRepository
import io.leonfoliveira.judge.core.util.TimeUtils
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import java.time.LocalDateTime
import java.util.Optional
import java.util.UUID

class FindSubmissionServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>()
    val memberRepository = mockk<MemberRepository>()

    val sut =
        FindSubmissionService(
            contestRepository = contestRepository,
            memberRepository = memberRepository,
        )

    val now = LocalDateTime.now()

    beforeEach {
        mockkObject(TimeUtils)
        every { TimeUtils.now() } returns now
    }

    context("findAllByContest") {
        val id = UUID.randomUUID()

        test("should throw NotFoundException when contest not found") {
            every { contestRepository.findById(id) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.findAllByContest(id)
            }
        }

        test("should throw ForbiddenException when contest has not started") {
            val contest = ContestMockFactory.build(startAt = now.plusDays(1))

            every { contestRepository.findById(id) }
                .returns(Optional.of(contest))

            shouldThrow<ForbiddenException> {
                sut.findAllByContest(id)
            }
        }

        test("should return submissions for contest") {
            val contest =
                ContestMockFactory.build(
                    startAt = now.minusDays(1),
                    members = listOf(MemberMockFactory.build(submissions = listOf(SubmissionMockFactory.build()))),
                )

            every { contestRepository.findById(id) }
                .returns(Optional.of(contest))

            val submissions = sut.findAllByContest(id)

            submissions shouldBe contest.members.flatMap { it.submissions }.sortedBy { it.createdAt }
        }
    }

    context("findAllByMember") {
        val memberId = UUID.randomUUID()

        test("should throw NotFoundException when member not found") {
            every { memberRepository.findById(memberId) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.findAllByMember(memberId)
            }
        }
    }
})
