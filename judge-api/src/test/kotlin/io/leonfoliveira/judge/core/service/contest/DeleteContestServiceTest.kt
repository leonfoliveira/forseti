package io.leonfoliveira.judge.core.service.contest

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.MemberMockFactory
import io.leonfoliveira.judge.core.domain.entity.ProblemMockFactory
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.MemberRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.leonfoliveira.judge.core.util.TimeUtils
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import java.time.LocalDateTime
import java.util.Optional

class DeleteContestServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>()
    val memberRepository = mockk<MemberRepository>()
    val problemRepository = mockk<ProblemRepository>()

    val sut = DeleteContestService(contestRepository, memberRepository, problemRepository)

    val now = LocalDateTime.now().minusYears(1)

    beforeTest {
        mockkObject(TimeUtils)
        every { TimeUtils.now() }.returns(now)
    }

    context("delete") {
        test("should throw NotFoundException when contest not found") {
            every { contestRepository.findById(any()) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.delete(1)
            }
        }

        test("should throw ForbiddenException when contest has started") {
            val contest = ContestMockFactory.build(startAt = now.minusDays(1))
            every { contestRepository.findById(any()) }
                .returns(Optional.of(contest))

            shouldThrow<ForbiddenException> {
                sut.delete(1)
            }
        }

        test("should delete contest") {
            val contest = ContestMockFactory.build(startAt = now.plusDays(1))
            every { contestRepository.findById(any()) }
                .returns(Optional.of(contest))
            every { contestRepository.save(any()) }
                .returns(contest)

            sut.delete(1)

            contest.deletedAt shouldBe now
        }
    }

    context("deleteMembers") {
        test("should delete members") {
            val members = listOf(MemberMockFactory.build(), MemberMockFactory.build())
            every { memberRepository.saveAll(members) }
                .returns(members)

            sut.deleteMembers(members)

            members.forEach { it.deletedAt shouldBe now }
        }
    }

    context("deleteProblems") {
        test("should delete problems") {
            val problems = listOf(ProblemMockFactory.build(), ProblemMockFactory.build())
            every { problemRepository.saveAll(problems) }
                .returns(problems)

            sut.deleteProblems(problems)

            problems.forEach { it.deletedAt shouldBe now }
        }
    }
})
