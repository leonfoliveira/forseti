package io.leonfoliveira.judge.core.service.submission

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.MemberMockFactory
import io.leonfoliveira.judge.core.domain.entity.SubmissionMockFactory
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.mockk.every
import io.mockk.mockk
import java.time.LocalDateTime
import java.util.Optional

class FindSubmissionServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>()

    val sut =
        FindSubmissionService(
            contestRepository = contestRepository,
        )

    context("findAllByContest") {
        test("should throw NotFoundException when contest not found") {
            every { contestRepository.findById(1) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.findAllByContest(1)
            }
        }

        test("should return sorted list of submissions") {
            val now = LocalDateTime.now()
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
                    members = listOf(member1, member2),
                )

            every { contestRepository.findById(1) }
                .returns(Optional.of(contest))

            val result = sut.findAllByContest(1)

            result shouldBe listOf(submission2, submission1)
        }
    }
})
