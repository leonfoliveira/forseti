package io.github.leonfoliveira.forseti.common.service.contest

import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.forseti.common.repository.ContestRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import java.time.OffsetDateTime
import java.util.Optional
import java.util.UUID

class FindContestServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)

        val sut = FindContestService(contestRepository)

        val now = OffsetDateTime.now()

        beforeEach {
            clearAllMocks()
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
        }

        context("findAll") {
            test("should return all contests") {
                val contests = listOf(ContestMockBuilder.build(), ContestMockBuilder.build())
                every { contestRepository.findAll() } returns contests

                val result = sut.findAll()

                result shouldBe contests
            }
        }

        context("findById") {
            val id = UUID.randomUUID()

            test("should throw NotFoundException if contest not found") {
                every { contestRepository.findById(id) } returns Optional.empty()

                shouldThrow<NotFoundException> {
                    sut.findById(id)
                }.message shouldBe "Could not find contest with id = $id"
            }

            test("should return contest by id") {
                val contest = ContestMockBuilder.build(id = id)
                every { contestRepository.findById(id) } returns Optional.of(contest)

                val result = sut.findById(contest.id)

                result shouldBe contest
            }
        }

        context("findBySlug") {
            val slug = "test-contest"

            test("should throw NotFoundException if contest not found") {
                every { contestRepository.findBySlug(slug) } returns null

                shouldThrow<NotFoundException> {
                    sut.findBySlug(slug)
                }.message shouldBe "Could not find contest with slug = $slug"
            }

            test("should return contest by slug") {
                val contest = ContestMockBuilder.build(slug = slug)
                every { contestRepository.findBySlug(slug) } returns contest

                val result = sut.findBySlug(slug)

                result shouldBe contest
            }
        }
    })
