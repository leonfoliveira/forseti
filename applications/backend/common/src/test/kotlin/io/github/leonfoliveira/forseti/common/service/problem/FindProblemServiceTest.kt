package io.github.leonfoliveira.forseti.common.service.problem

import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.mock.entity.ProblemMockBuilder
import io.github.leonfoliveira.forseti.common.repository.ProblemRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import java.util.Optional
import java.util.UUID

class FindProblemServiceTest :
    FunSpec({
        val problemRepository = mockk<ProblemRepository>(relaxed = true)

        val sut = FindProblemService(problemRepository)

        context("findById") {
            val problemId = UUID.randomUUID()

            test("should throw NotFoundException when problem is not found") {
                every { problemRepository.findById(problemId) } returns Optional.empty()

                shouldThrow<NotFoundException> {
                    sut.findById(problemId)
                }.message shouldBe "Could not find problem with id = $problemId"
            }

            test("should return problem when found") {
                val problem = ProblemMockBuilder.build(id = problemId)
                every { problemRepository.findById(problemId) } returns Optional.of(problem)

                val result = sut.findById(problemId)

                result shouldBe problem
            }
        }
    })
