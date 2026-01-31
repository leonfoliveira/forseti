package com.forsetijudge.core.application.service.problem

import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk

class FindProblemServiceTest :
    FunSpec({
        val problemRepository = mockk<ProblemRepository>(relaxed = true)

        val sut = FindProblemService(problemRepository)

        context("findById") {
            val problemId = UuidCreator.getTimeOrderedEpoch()

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
