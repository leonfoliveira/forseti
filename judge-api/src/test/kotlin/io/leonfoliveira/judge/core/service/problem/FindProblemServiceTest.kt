package io.leonfoliveira.judge.core.service.problem

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.ProblemMockFactory
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.repository.ProblemRepository
import io.mockk.every
import io.mockk.mockk
import java.util.Optional

class FindProblemServiceTest : FunSpec({
    val problemRepository = mockk<ProblemRepository>()
    val contestRepository = mockk<ContestRepository>()

    val sut =
        FindProblemService(
            problemRepository = problemRepository,
            contestRepository = contestRepository,
        )

    context("findById") {
        test("should throw NotFoundException when problem not found") {
            every { problemRepository.findById(1) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.findById(1)
            }
        }

        test("should return problem when found") {
            val problem = ProblemMockFactory.build()
            every { problemRepository.findById(1) }
                .returns(Optional.of(problem))

            val result = sut.findById(1)

            result shouldBe problem
        }
    }

    context("findAllByContest") {
        test("should throw NotFoundException when contest not found") {
            every { contestRepository.findById(1) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.findAllByContest(1)
            }
        }

        test("should return problems when found") {
            val contest =
                ContestMockFactory.build(
                    problems = listOf(ProblemMockFactory.build()),
                )
            every { contestRepository.findById(1) }
                .returns(Optional.of(contest))

            val result = sut.findAllByContest(1)

            result shouldBe contest.problems
        }
    }
})
