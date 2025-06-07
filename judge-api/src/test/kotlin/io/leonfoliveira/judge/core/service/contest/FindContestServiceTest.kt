package io.leonfoliveira.judge.core.service.contest

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.mockk.every
import io.mockk.mockk
import java.util.Optional
import java.util.UUID

class FindContestServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>()

    val sut = FindContestService(contestRepository)

    context("findAll") {
        test("should return all contests") {
            val contests = listOf(ContestMockFactory.build(), ContestMockFactory.build())
            every { contestRepository.findAll() }
                .returns(contests)

            val result = sut.findAll()

            result shouldBe contests
        }
    }

    context("findById") {
        test("should throw NotFoundException when contest not found") {
            val id = UUID.randomUUID()
            every { contestRepository.findById(id) }
                .returns(Optional.empty())

            shouldThrow<NotFoundException> {
                sut.findById(id)
            }
        }

        test("should return contest") {
            val id = UUID.randomUUID()
            val contest = ContestMockFactory.build()
            every { contestRepository.findById(id) }
                .returns(Optional.of(contest))

            val result = sut.findById(id)

            result shouldBe contest
        }
    }

    context("findBySlug") {
        test("should throw NotFoundException when contest not found") {
            val slug = "test-slug"
            every { contestRepository.findBySlug(slug) }
                .returns(null)

            shouldThrow<NotFoundException> {
                sut.findBySlug(slug)
            }
        }

        test("should return contest") {
            val slug = "test-slug"
            val contest = ContestMockFactory.build()
            every { contestRepository.findBySlug(slug) }
                .returns(contest)

            val result = sut.findBySlug(slug)

            result shouldBe contest
        }
    }
})
