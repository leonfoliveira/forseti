package io.leonfoliveira.judge.core.service.submission

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.MemberMockFactory
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.MemberRepository
import io.leonfoliveira.judge.core.service.dto.output.toOutputDTO
import io.leonfoliveira.judge.core.util.TimeUtils
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import java.time.LocalDateTime
import java.util.Optional

class FindSubmissionServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>()
    val memberRepository = mockk<MemberRepository>()
    val bucketAdapter = mockk<BucketAdapter>()

    val sut =
        FindSubmissionService(
            contestRepository = contestRepository,
            memberRepository = memberRepository,
            bucketAdapter = bucketAdapter,
        )

    val now = LocalDateTime.now()

    beforeEach {
        mockkObject(TimeUtils)
        every { TimeUtils.now() } returns now
    }

    context("findAllByContest") {
        test("should throw NotFoundException when contest not found") {
            every { contestRepository.findById(1) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.findAllByContest(1)
            }
        }

        test("should throw ForbiddenException when contest has not started") {
            val contest = ContestMockFactory.build(startAt = now.plusDays(1))

            every { contestRepository.findById(1) }
                .returns(Optional.of(contest))

            shouldThrow<ForbiddenException> {
                sut.findAllByContest(1)
            }
        }

        test("should return sorted list of submissions") {
            val submission1 = SubmissionMockFactory.build(createdAt = now)
            val submission2 = SubmissionMockFactory.build(createdAt = now.minusSeconds(1))
            val member1 =
                MemberMockFactory.build(
                    submissions = listOf(submission1),
                )
            val member2 =
                MemberMockFactory.build(
                    submissions = listOf(submission2),
                )
            val contest =
                ContestMockFactory.build(
                    startAt = now.minusDays(1),
                    members = listOf(member1, member2),
                )

            every { contestRepository.findById(1) }
                .returns(Optional.of(contest))

            val result = sut.findAllByContest(1)

            result shouldBe listOf(submission2, submission1).map { it.toOutputDTO() }
        }
    }
})
