package io.github.leonfoliveira.judge.common.service.contest

import io.github.leonfoliveira.judge.common.domain.entity.Contest
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ProblemMockBuilder
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.repository.MemberRepository
import io.github.leonfoliveira.judge.common.repository.ProblemRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime
import java.util.Optional
import java.util.UUID

class DeleteContestServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>(relaxed = true)
    val memberRepository = mockk<MemberRepository>(relaxed = true)
    val problemRepository = mockk<ProblemRepository>(relaxed = true)

    val sut =
        DeleteContestService(
            contestRepository = contestRepository,
            memberRepository = memberRepository,
            problemRepository = problemRepository,
        )

    beforeEach {
        clearAllMocks()
    }

    context("delete") {
        val id = UUID.randomUUID()

        test("should throw NotFoundException when contest does not exist") {
            every { contestRepository.findById(id) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.delete(id)
            }.message shouldBe "Could not find contest with id = $id"
        }

        test("should throw ForbiddenException when contest has started") {
            val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
            every { contestRepository.findById(id) } returns Optional.of(contest)

            shouldThrow<ForbiddenException> {
                sut.delete(id)
            }.message shouldBe "Contest already started"
        }

        test("should delete contest when it has not started") {
            val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
            every { contestRepository.findById(id) } returns Optional.of(contest)
            every { contestRepository.save(any<Contest>()) } answers { firstArg() }

            sut.delete(id)

            contest.deletedAt shouldNotBe null
            verify { contestRepository.save(contest) }
        }
    }

    context("deleteMembers") {
        val members = listOf(MemberMockBuilder.build(), MemberMockBuilder.build())

        test("should delete members") {
            every { memberRepository.saveAll(members) } answers { firstArg() }

            sut.deleteMembers(members)

            members.forEach { it.deletedAt shouldNotBe null }
            verify { memberRepository.saveAll(members) }
        }
    }

    context("deleteProblems") {
        val problems = listOf(ProblemMockBuilder.build(), ProblemMockBuilder.build())

        test("should delete problems") {
            every { problemRepository.saveAll(problems) } answers { firstArg() }

            sut.deleteProblems(problems)

            problems.forEach { it.deletedAt shouldNotBe null }
            verify { problemRepository.saveAll(problems) }
        }
    }
})
