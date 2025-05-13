package io.leonfoliveira.judge.core.service.contest

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.leonfoliveira.judge.core.entity.Contest
import io.leonfoliveira.judge.core.entity.Member
import io.leonfoliveira.judge.core.entity.Problem
import io.leonfoliveira.judge.core.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.MemberRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.leonfoliveira.judge.core.util.TimeUtils
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.verify
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

        test("should delete contest") {
            val contest = mockk<Contest>(relaxed = true)
            every { contestRepository.findById(any()) }
                .returns(Optional.of(contest))
            every { contestRepository.save(any()) }
                .returns(contest)

            sut.delete(1)

            verify { contest.deletedAt = now }
        }
    }

    context("deleteMembers") {
        test("should delete members") {
            val members = listOf(mockk<Member>(relaxed = true), mockk<Member>(relaxed = true))
            every { memberRepository.saveAll(members) }
                .returns(members)

            sut.deleteMembers(members)

            verify { members.forEach { it.deletedAt = now } }
        }
    }

    context("deleteProblems") {
        test("should delete problems") {
            val problems = listOf(mockk<Problem>(relaxed = true), mockk<Problem>(relaxed = true))
            every { problemRepository.saveAll(problems) }
                .returns(problems)

            sut.deleteProblems(problems)

            verify { problems.forEach { it.deletedAt = now } }
        }
    }
})
