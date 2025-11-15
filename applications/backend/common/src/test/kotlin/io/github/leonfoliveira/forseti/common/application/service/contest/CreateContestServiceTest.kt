package io.github.leonfoliveira.forseti.common.application.service.contest

import io.github.leonfoliveira.forseti.common.application.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.application.domain.exception.ConflictException
import io.github.leonfoliveira.forseti.common.application.dto.input.contest.CreateContestInputDTO
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ContestRepository
import io.github.leonfoliveira.forseti.common.mock.entity.ContestMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime

class CreateContestServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)

        val sut =
            CreateContestService(
                contestRepository = contestRepository,
            )

        beforeEach {
            clearAllMocks()
        }

        context("create") {
            val inputDTO =
                CreateContestInputDTO(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.PYTHON_312),
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2),
                )

            test("should throw ConflictException when contest with same slug already exists") {
                every { contestRepository.findBySlug(inputDTO.slug) } returns ContestMockBuilder.build()

                shouldThrow<ConflictException> {
                    sut.create(inputDTO)
                }.message shouldBe "Contest with slug '${inputDTO.slug}' already exists"
            }

            test("should create contest successfully") {
                every { contestRepository.findBySlug(inputDTO.slug) } returns null
                every { contestRepository.save(any<Contest>()) } answers { firstArg() }

                val contest = sut.create(inputDTO)

                contest.slug shouldBe inputDTO.slug
                contest.title shouldBe inputDTO.title
                contest.languages shouldBe inputDTO.languages
                contest.startAt shouldBe inputDTO.startAt
                contest.endAt shouldBe inputDTO.endAt
                verify { contestRepository.save(contest) }
            }
        }
    })
