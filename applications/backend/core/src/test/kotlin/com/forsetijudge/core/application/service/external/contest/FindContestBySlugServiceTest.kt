package com.forsetijudge.core.application.service.external.contest

import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driving.usecase.external.contest.FindContestBySlugUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk

class FindContestBySlugServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)

        val sut = FindContestBySlugService(contestRepository)

        beforeEach {
            clearAllMocks()
        }

        val command = FindContestBySlugUseCase.Command(slug = "contest")

        test("should throw NotFoundException when contest is not found") {
            every { contestRepository.findBySlug(command.slug) } returns null

            shouldThrow<NotFoundException> {
                sut.execute(command)
            }
        }

        test("should return contest when contest is found") {
            val contest = ContestMockBuilder.build(slug = command.slug)
            every { contestRepository.findBySlug(command.slug) } returns contest

            val result = sut.execute(command)

            assert(result == contest)
        }
    })
