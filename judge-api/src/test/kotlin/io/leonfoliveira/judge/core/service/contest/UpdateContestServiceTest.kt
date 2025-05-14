package io.leonfoliveira.judge.core.service.contest

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.Contest
import io.leonfoliveira.judge.core.domain.entity.ContestMockFactory
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.entity.MemberMockFactory
import io.leonfoliveira.judge.core.domain.entity.ProblemMockFactory
import io.leonfoliveira.judge.core.domain.exception.NotFoundException
import io.leonfoliveira.judge.core.domain.model.Attachment
import io.leonfoliveira.judge.core.port.BucketAdapter
import io.leonfoliveira.judge.core.port.HashAdapter
import io.leonfoliveira.judge.core.repository.ContestRepository
import io.leonfoliveira.judge.core.service.dto.input.UpdateContestInputDTO
import io.leonfoliveira.judge.core.service.dto.input.UpdateContestInputDTOMockFactory
import io.mockk.every
import io.mockk.mockk
import java.time.LocalDateTime

class UpdateContestServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>()
    val hashAdapter = mockk<HashAdapter>()
    val bucketAdapter = mockk<BucketAdapter>()
    val findContestService = mockk<FindContestService>()
    val createContestService = mockk<CreateContestService>()
    val deleteContestService = mockk<DeleteContestService>()

    val sut =
        UpdateContestService(
            contestRepository = contestRepository,
            hashAdapter = hashAdapter,
            bucketAdapter = bucketAdapter,
            findContestService = findContestService,
            createContestService = createContestService,
            deleteContestService = deleteContestService,
        )

    context("update") {
        test("should throw NotFoundException when member not found") {
            val input =
                UpdateContestInputDTO(
                    id = 1,
                    title = "Test Contest",
                    languages = listOf(),
                    startAt = LocalDateTime.now(),
                    endAt = LocalDateTime.now().plusDays(1),
                    members =
                        listOf(
                            UpdateContestInputDTO.MemberDTO(
                                id = 2,
                                type = Member.Type.CONTESTANT,
                                name = "Contestant Name",
                                login = "contestant_login",
                                password = "contestant_password",
                            ),
                        ),
                    problems = listOf(),
                )
            val contest =
                Contest(
                    id = 1,
                    title = "Test Contest",
                    languages = listOf(),
                    startAt = LocalDateTime.now(),
                    endAt = LocalDateTime.now().plusDays(1),
                    members = listOf(),
                    problems = listOf(),
                )
            every { findContestService.findById(input.id) }
                .returns(contest)

            shouldThrow<NotFoundException> {
                sut.update(input)
            }
        }

        test("should throw NotFoundException when problem not found") {
            val input =
                UpdateContestInputDTO(
                    id = 1,
                    title = "Test Contest",
                    languages = listOf(),
                    startAt = LocalDateTime.now(),
                    endAt = LocalDateTime.now().plusDays(1),
                    members = listOf(),
                    problems =
                        listOf(
                            UpdateContestInputDTO.ProblemDTO(
                                id = 2,
                                title = "Problem 1",
                                description = "Problem 1 description",
                                timeLimit = 1000,
                                testCases = null,
                            ),
                        ),
                )
            val contest =
                Contest(
                    id = 1,
                    title = "Test Contest",
                    languages = listOf(),
                    startAt = LocalDateTime.now(),
                    endAt = LocalDateTime.now().plusDays(1),
                    members = listOf(),
                    problems = listOf(),
                )
            every { findContestService.findById(input.id) }
                .returns(contest)

            shouldThrow<NotFoundException> {
                sut.update(input)
            }
        }

        test("should update contest") {
            val memberDTOToInsert = UpdateContestInputDTOMockFactory.buildMemberDTO(id = null)
            val memberDTOToUpdate = UpdateContestInputDTOMockFactory.buildMemberDTO(id = 2, password = null)
            val memberDTOToUpdatePassword = UpdateContestInputDTOMockFactory.buildMemberDTO(id = 3)

            val problemDTOToInsert = UpdateContestInputDTOMockFactory.buildProblemDTO(id = null)
            val problemDTOToUpdate = UpdateContestInputDTOMockFactory.buildProblemDTO(id = 2, testCases = null)
            val problemDTOToUpdateTestCases = UpdateContestInputDTOMockFactory.buildProblemDTO(id = 3)

            val inputDTO =
                UpdateContestInputDTOMockFactory.build(
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

            every { findContestService.findById(any()) }
                .returns(contest)
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
            val attachment =
                Attachment(
                    filename = "test_case_1.java",
                    key = "123456",
                )
            every { bucketAdapter.upload(any()) }
                .returns(attachment)

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
            problemToUpdateTestCases.testCases shouldBe attachment
        }
    }
})
