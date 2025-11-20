package live.forseti.core.application.service.contest

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import live.forseti.core.domain.entity.ContestMockBuilder
import live.forseti.core.domain.exception.NotFoundException
import live.forseti.core.port.driven.repository.ContestRepository
import java.time.OffsetDateTime
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
                every { contestRepository.findEntityById(id) } returns null

                shouldThrow<NotFoundException> {
                    sut.findById(id)
                }.message shouldBe "Could not find contest with id = $id"
            }

            test("should return contest by id") {
                val contest = ContestMockBuilder.build(id = id)
                every { contestRepository.findEntityById(id) } returns contest

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
