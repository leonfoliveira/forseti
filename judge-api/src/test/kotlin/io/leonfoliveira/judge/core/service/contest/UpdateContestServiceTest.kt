package io.leonfoliveira.judge.core.service.contest

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.leonfoliveira.judge.core.domain.entity.AttachmentMockFactory
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.entity.MemberMockFactory
import io.leonfoliveira.judge.core.domain.entity.ProblemMockFactory
import io.leonfoliveira.judge.core.domain.exception.ForbiddenException
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.repository.AttachmentRepository
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.UpdateContestInputDTOMockFactory
import io.leonfoliveira.judge.core.util.TimeUtils
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import jakarta.validation.Validation
import java.time.LocalDateTime
import java.util.Optional

class UpdateContestServiceTest : FunSpec({
    val attachmentRepository = mockk<AttachmentRepository>()
    val contestRepository = mockk<ContestRepository>()
    val hashAdapter = mockk<HashAdapter>()
    val createContestService = mockk<CreateContestService>()
    val deleteContestService = mockk<DeleteContestService>()

    val validator = Validation.buildDefaultValidatorFactory().validator

    val sut =
        UpdateContestService(
            attachmentRepository,
            contestRepository = contestRepository,
            hashAdapter = hashAdapter,
            createContestService = createContestService,
            deleteContestService = deleteContestService,
        )

    val now = LocalDateTime.now()

    beforeEach {
        mockkObject(TimeUtils)
        every { TimeUtils.now() } returns now
    }

    context("update") {
        listOf(
            UpdateContestInputDTOMockFactory.build(
                members = listOf(UpdateContestInputDTOMockFactory.buildMemberDTO(type = Member.Type.ROOT)),
            ),
            UpdateContestInputDTOMockFactory.build(
                members = listOf(UpdateContestInputDTOMockFactory.buildMemberDTO(name = "")),
            ),
            UpdateContestInputDTOMockFactory.build(
                members = listOf(UpdateContestInputDTOMockFactory.buildMemberDTO(login = "")),
            ),
            UpdateContestInputDTOMockFactory.build(
                members = listOf(UpdateContestInputDTOMockFactory.buildMemberDTO(password = "")),
            ),
            UpdateContestInputDTOMockFactory.build(
                members = listOf(UpdateContestInputDTOMockFactory.buildMemberDTO(id = null, password = null)),
            ),
            UpdateContestInputDTOMockFactory.build(
                problems = listOf(UpdateContestInputDTOMockFactory.buildProblemDTO(title = "")),
            ),
            UpdateContestInputDTOMockFactory.build(
                problems = listOf(UpdateContestInputDTOMockFactory.buildProblemDTO(timeLimit = 0)),
            ),
            UpdateContestInputDTOMockFactory.build(title = ""),
            UpdateContestInputDTOMockFactory.build(languages = emptyList()),
            UpdateContestInputDTOMockFactory.build(startAt = now, endAt = now),
            UpdateContestInputDTOMockFactory.build(startAt = now.minusDays(1)),
        ).forEach { dto ->
            test("should validate inputDTO") {
                validator.validate(dto).size shouldNotBe 0
            }
        }

        test("should throw ForbiddenException when contest not started") {
            val input = UpdateContestInputDTOMockFactory.build()
            every { contestRepository.findById(input.id) }
                .returns(Optional.of(ContestMockFactory.build(startAt = now.minusDays(1))))

            shouldThrow<ForbiddenException> {
                sut.update(input)
            }
        }

        test("should throw NotFoundException when member not found") {
            val input =
                UpdateContestInputDTOMockFactory.build(
                    members = listOf(UpdateContestInputDTOMockFactory.buildMemberDTO(id = 1)),
                )
            val contest = ContestMockFactory.build(members = listOf())
            every { contestRepository.findById(input.id) }
                .returns(Optional.of(contest))

            shouldThrow<NotFoundException> {
                sut.update(input)
            }
        }

        test("should throw NotFoundException when problem not found") {
            val input =
                UpdateContestInputDTOMockFactory.build(
                    problems = listOf(UpdateContestInputDTOMockFactory.buildProblemDTO(id = 1)),
                )
            val contest = ContestMockFactory.build(problems = listOf())
            every { contestRepository.findById(input.id) }
                .returns(Optional.of(contest))

            shouldThrow<NotFoundException> {
                sut.update(input)
            }
        }

        test("should update contest") {
            val memberDTOToInsert = UpdateContestInputDTOMockFactory.buildMemberDTO(id = null)
            val memberDTOToUpdate = UpdateContestInputDTOMockFactory.buildMemberDTO(id = 2, password = null)
            val memberDTOToUpdatePassword = UpdateContestInputDTOMockFactory.buildMemberDTO(id = 3)

            val problemDTOToInsert = UpdateContestInputDTOMockFactory.buildProblemDTO(id = null)
            val problemDTOToUpdate = UpdateContestInputDTOMockFactory.buildProblemDTO(id = 2)
            val problemDTOToUpdateTestCases = UpdateContestInputDTOMockFactory.buildProblemDTO(id = 3)

            val inputDTO =
                UpdateContestInputDTOMockFactory.build(
                    startAt = now.plusDays(1),
                    endAt = now.plusDays(2),
                    members = listOf(memberDTOToInsert, memberDTOToUpdate, memberDTOToUpdatePassword),
                    problems = listOf(problemDTOToInsert, problemDTOToUpdate, problemDTOToUpdateTestCases),
                )

            val memberToDelete = MemberMockFactory.build(id = 1)
            val memberToUpdate = MemberMockFactory.build(id = 2)
            val memberToUpdatePassword = MemberMockFactory.build(id = 3)

            val problemToDelete = ProblemMockFactory.build(id = 1)
            val problemToUpdate = ProblemMockFactory.build(id = 2)
            val problemToUpdateTestCases = ProblemMockFactory.build(id = 3)

            val contest =
                ContestMockFactory.build(
                    members = listOf(memberToDelete, memberToUpdate, memberToUpdatePassword),
                    problems = listOf(problemToDelete, problemToUpdate, problemToUpdateTestCases),
                )

            every { attachmentRepository.findById(any()) }
                .returns(Optional.of(AttachmentMockFactory.build()))
            every { contestRepository.findById(any()) }
                .returns(Optional.of(contest))
            val createdMember = MemberMockFactory.build()
            every { createContestService.createMember(any(), any()) }
                .returns(createdMember)
            val createdProblem = ProblemMockFactory.build()
            every { createContestService.createProblem(any(), any()) }
                .returns(createdProblem)
            every { deleteContestService.deleteMembers(listOf(memberToDelete)) }
                .returns(Unit)
            every { deleteContestService.deleteProblems(listOf(problemToDelete)) }
                .returns(Unit)
            every { contestRepository.save(any()) }
                .returnsArgument(0)
            every { hashAdapter.hash(any()) }
                .returns("new_hashed_password")

            val result = sut.update(inputDTO)

            result.members shouldContainExactlyInAnyOrder
                listOf(
                    createdMember,
                    memberToUpdate,
                    memberToUpdatePassword,
                )
            memberToUpdatePassword.password shouldBe "new_hashed_password"
            result.problems shouldContainExactlyInAnyOrder
                listOf(
                    createdProblem,
                    problemToUpdate,
                    problemToUpdateTestCases,
                )
        }
    }
})
