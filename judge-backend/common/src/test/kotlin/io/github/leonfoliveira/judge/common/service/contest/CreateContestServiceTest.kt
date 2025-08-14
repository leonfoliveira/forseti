package io.github.leonfoliveira.judge.common.service.contest

import io.github.leonfoliveira.judge.common.domain.entity.Contest
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.enumerate.Language
import io.github.leonfoliveira.judge.common.domain.exception.ConflictException
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.port.HashAdapter
import io.github.leonfoliveira.judge.common.repository.AttachmentRepository
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.service.dto.input.attachment.AttachmentInputDTO
import io.github.leonfoliveira.judge.common.service.dto.input.contest.CreateContestInputDTO
import io.github.leonfoliveira.judge.common.util.TestCasesValidator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import jakarta.validation.Validation
import java.time.OffsetDateTime
import java.util.Optional
import java.util.UUID

class CreateContestServiceTest : FunSpec({
    val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
    val contestRepository = mockk<ContestRepository>(relaxed = true)
    val hashAdapter = mockk<HashAdapter>(relaxed = true)
    val testCasesValidator = mockk<TestCasesValidator>(relaxed = true)

    val sut =
        CreateContestService(
            attachmentRepository = attachmentRepository,
            contestRepository = contestRepository,
            hashAdapter = hashAdapter,
            testCasesValidator = testCasesValidator,
        )

    beforeEach {
        clearAllMocks()
    }

    context("create") {
        val inputDTO =
            CreateContestInputDTO(
                slug = "test-contest",
                title = "Test Contest",
                languages = listOf(Language.PYTHON_3_13),
                startAt = OffsetDateTime.now().plusHours(1),
                endAt = OffsetDateTime.now().plusHours(2),
                members =
                    listOf(
                        CreateContestInputDTO.MemberDTO(
                            type = Member.Type.CONTESTANT,
                            name = "Contestant",
                            login = "contestant",
                            password = "password123",
                        ),
                    ),
                problems =
                    listOf(
                        CreateContestInputDTO.ProblemDTO(
                            letter = 'A',
                            title = "Problem A",
                            description =
                                AttachmentInputDTO(
                                    id = UUID.randomUUID(),
                                ),
                            timeLimit = 1000,
                            memoryLimit = 256,
                            testCases =
                                AttachmentInputDTO(
                                    id = UUID.randomUUID(),
                                ),
                        ),
                    ),
            )

        test("should throw ForbiddenException when any member is ROOT") {
            val invalidInputDTO = inputDTO.copy(members = listOf(inputDTO.members[0].copy(type = Member.Type.ROOT)))

            shouldThrow<ForbiddenException> {
                sut.create(invalidInputDTO)
            }.message shouldBe "Contest cannot have ROOT members"
        }

        test("should throw ConflictException when contest with same slug already exists") {
            every { contestRepository.findBySlug(inputDTO.slug) } returns ContestMockBuilder.build()

            shouldThrow<ConflictException> {
                sut.create(inputDTO)
            }.message shouldBe "Contest with slug '${inputDTO.slug}' already exists"
        }

        test("should throw NotFoundException when description attachment is not found") {
            every { contestRepository.findBySlug(inputDTO.slug) } returns null
            every { attachmentRepository.findById(inputDTO.problems[0].description.id) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.create(inputDTO)
            }.message shouldBe "Could not find description attachment with id: ${inputDTO.problems[0].description.id}"
        }

        test("should throw NotFoundException when test cases attachment is not found") {
            every { contestRepository.findBySlug(inputDTO.slug) } returns null
            every { attachmentRepository.findById(inputDTO.problems[0].description.id) } returns Optional.of(AttachmentMockBuilder.build())
            every { attachmentRepository.findById(inputDTO.problems[0].testCases.id) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.create(inputDTO)
            }.message shouldBe "Could not find testCases attachment with id: ${inputDTO.problems[0].testCases.id}"
        }

        test("should create contest successfully") {
            every { contestRepository.findBySlug(inputDTO.slug) } returns null
            val hash = "hashedPassword"
            every { hashAdapter.hash(inputDTO.members[0].password) } returns hash
            val descriptionAttachment = AttachmentMockBuilder.build()
            every { attachmentRepository.findById(inputDTO.problems[0].description.id) } returns Optional.of(descriptionAttachment)
            val testCasesAttachment = AttachmentMockBuilder.build()
            every { attachmentRepository.findById(inputDTO.problems[0].testCases.id) } returns Optional.of(testCasesAttachment)
            every { contestRepository.save(any<Contest>()) } answers { firstArg() }

            val contest = sut.create(inputDTO)

            contest.slug shouldBe inputDTO.slug
            contest.title shouldBe inputDTO.title
            contest.languages shouldBe inputDTO.languages
            contest.startAt shouldBe inputDTO.startAt
            contest.endAt shouldBe inputDTO.endAt
            contest.members.size shouldBe 1
            contest.members[0].type shouldBe inputDTO.members[0].type
            contest.members[0].name shouldBe inputDTO.members[0].name
            contest.members[0].login shouldBe inputDTO.members[0].login
            contest.members[0].password shouldBe hash
            contest.problems.size shouldBe 1
            contest.problems[0].letter shouldBe inputDTO.problems[0].letter
            contest.problems[0].title shouldBe inputDTO.problems[0].title
            contest.problems[0].description shouldBe descriptionAttachment
            contest.problems[0].timeLimit shouldBe inputDTO.problems[0].timeLimit
            contest.problems[0].memoryLimit shouldBe inputDTO.problems[0].memoryLimit
            contest.problems[0].testCases shouldBe testCasesAttachment
            verify { testCasesValidator.validate(testCasesAttachment) }
            verify { contestRepository.save(contest) }
        }
    }
})
