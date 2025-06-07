package io.leonfoliveira.judge.core.service.contest

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.leonfoliveira.judge.core.domain.entity.AttachmentMockFactory
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.repository.AttachmentRepository
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.AttachmentInputDTOMockFactory
import io.leonfoliveira.judge.core.service.dto.input.CreateContestInputDTOMockFactory
import io.leonfoliveira.judge.core.util.TestCasesValidator
import io.leonfoliveira.judge.core.util.TimeUtils
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.verify
import jakarta.validation.Validation
import java.time.LocalDateTime
import java.util.Optional
import java.util.UUID

class CreateContestServiceTest : FunSpec({
    val attachmentRepository = mockk<AttachmentRepository>()
    val contestRepository = mockk<ContestRepository>()
    val hashAdapter = mockk<HashAdapter>()
    val testCasesValidator = mockk<TestCasesValidator>(relaxed = true)

    val validator = Validation.buildDefaultValidatorFactory().validator

    val sut =
        CreateContestService(
            attachmentRepository = attachmentRepository,
            contestRepository = contestRepository,
            hashAdapter = hashAdapter,
            testCasesValidator = testCasesValidator,
        )

    val now = LocalDateTime.now()

    beforeEach {
        mockkObject(TimeUtils)
        every { TimeUtils.now() } returns now
    }

    context("create") {
        test("should throw ForbiddenException if any member is root") {
            val input =
                CreateContestInputDTOMockFactory.build(
                    members = listOf(CreateContestInputDTOMockFactory.buildMemberDTO(type = Member.Type.ROOT)),
                )
            shouldThrow<ForbiddenException> {
                sut.create(input)
            }
        }

        listOf(
            CreateContestInputDTOMockFactory.build(
                members = listOf(CreateContestInputDTOMockFactory.buildMemberDTO(type = Member.Type.ROOT)),
            ),
            CreateContestInputDTOMockFactory.build(
                members = listOf(CreateContestInputDTOMockFactory.buildMemberDTO(name = "")),
            ),
            CreateContestInputDTOMockFactory.build(
                members = listOf(CreateContestInputDTOMockFactory.buildMemberDTO(login = "")),
            ),
            CreateContestInputDTOMockFactory.build(
                members = listOf(CreateContestInputDTOMockFactory.buildMemberDTO(password = "")),
            ),
            CreateContestInputDTOMockFactory.build(
                problems = listOf(CreateContestInputDTOMockFactory.buildProblemDTO(title = "")),
            ),
            CreateContestInputDTOMockFactory.build(
                problems = listOf(CreateContestInputDTOMockFactory.buildProblemDTO(timeLimit = 0)),
            ),
            CreateContestInputDTOMockFactory.build(title = ""),
            CreateContestInputDTOMockFactory.build(
                languages = listOf(),
            ),
            CreateContestInputDTOMockFactory.build(
                startAt = now.plusDays(1),
                endAt = now.plusDays(1),
            ),
        ).forEach { dto ->
            test("should validate inputDTO") {
                validator.validate(dto).size shouldNotBe 0
            }
        }

        test("should throw NotFoundException if description attachment is not found") {
            val id = UUID.randomUUID()
            val input =
                CreateContestInputDTOMockFactory.build(
                    problems =
                        listOf(
                            CreateContestInputDTOMockFactory.buildProblemDTO(
                                description = AttachmentInputDTOMockFactory.build(id = id),
                            ),
                        ),
                )
            every { attachmentRepository.findById(any()) }
                .returns(Optional.of(AttachmentMockFactory.build()))
            every { attachmentRepository.findById(id) }
                .returns(Optional.empty())
            every { hashAdapter.hash(any()) }
                .returns("hashed_password")

            shouldThrow<NotFoundException> {
                sut.create(input)
            }
        }

        test("should throw NotFoundException if testCases attachment is not found") {
            val id = UUID.randomUUID()
            val input =
                CreateContestInputDTOMockFactory.build(
                    problems =
                        listOf(
                            CreateContestInputDTOMockFactory.buildProblemDTO(
                                testCases = AttachmentInputDTOMockFactory.build(id = id),
                            ),
                        ),
                )
            every { attachmentRepository.findById(any()) }
                .returns(Optional.of(AttachmentMockFactory.build()))
            every { attachmentRepository.findById(id) }
                .returns(Optional.empty())
            every { hashAdapter.hash(any()) }
                .returns("hashed_password")

            shouldThrow<NotFoundException> {
                sut.create(input)
            }
        }

        test("should create a contest") {
            val startAt = now.plusDays(1)
            val endAt = startAt.plusDays(1)
            val input =
                CreateContestInputDTOMockFactory.build(
                    startAt = startAt,
                    endAt = endAt,
                )
            val attachment = AttachmentMockFactory.build()
            every { attachmentRepository.findById(any()) }
                .returns(Optional.of(attachment))
            every { contestRepository.save(any()) }
                .returnsArgument(0)
            every { hashAdapter.hash(any()) }
                .returns("hashed_password")

            val result = sut.create(input)

            result.title shouldBe input.title
            result.languages shouldBe input.languages
            result.startAt shouldBe startAt
            result.endAt shouldBe endAt
            result.members[0].name shouldBe input.members[0].name
            result.members[0].login shouldBe input.members[0].login
            result.members[0].type shouldBe input.members[0].type
            result.problems[0].title shouldBe input.problems[0].title
            result.problems[0].timeLimit shouldBe input.problems[0].timeLimit

            verify { testCasesValidator.validate(attachment) }
        }
    }
})
