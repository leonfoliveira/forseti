package io.github.leonfoliveira.forseti.common.application.service.problem

import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.mock.entity.ProblemMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import java.util.UUID

class FindProblemServiceTest :
    FunSpec({
        val problemRepository = mockk<ProblemRepository>(relaxed = true)

        val sut = FindProblemService(problemRepository)

        context("findById") {
            val problemId = UUID.randomUUID()

            test("should throw NotFoundException when problem is not found") {
                every { problemRepository.findEntityById(problemId) } returns null

                shouldThrow<NotFoundException> {
                    sut.findById(problemId)
                }.message shouldBe "Could not find problem with id = $problemId"
            }

            test("should return problem when found") {
                val problem = ProblemMockBuilder.build(id = problemId)
                every { problemRepository.findEntityById(problemId) } returns problem

                val result = sut.findById(problemId)

                result shouldBe problem
            }
        }
    })
