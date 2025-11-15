package io.github.leonfoliveira.forseti.common.application.service.contest

import io.github.leonfoliveira.forseti.common.application.domain.entity.Contest
import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.application.domain.exception.BusinessException
import io.github.leonfoliveira.forseti.common.application.domain.exception.ConflictException
import io.github.leonfoliveira.forseti.common.application.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.application.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.application.dto.input.attachment.AttachmentInputDTO
import io.github.leonfoliveira.forseti.common.application.dto.input.contest.UpdateContestInputDTO
import io.github.leonfoliveira.forseti.common.application.port.driven.HashAdapter
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.AttachmentRepository
import io.github.leonfoliveira.forseti.common.application.port.driven.repository.ContestRepository
import io.github.leonfoliveira.forseti.common.application.util.TestCasesValidator
import io.github.leonfoliveira.forseti.common.mock.entity.AttachmentMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.ProblemMockBuilder
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.verify
import java.time.OffsetDateTime
import java.util.UUID

class UpdateContestServiceTest :
    FunSpec({
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val hashAdapter = mockk<HashAdapter>(relaxed = true)
        val deleteContestService = mockk<DeleteContestService>(relaxed = true)
        val testCasesValidator = mockk<TestCasesValidator>(relaxed = true)

        val sut =
            UpdateContestService(
                attachmentRepository,
                contestRepository,
                hashAdapter,
                deleteContestService,
                testCasesValidator,
            )

        val now = OffsetDateTime.now()

        beforeEach {
            clearAllMocks()
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
        }

        context("update") {
            val inputDTO =
                UpdateContestInputDTO(
                    id = UUID.randomUUID(),
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.PYTHON_312),
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2),
                    settings = UpdateContestInputDTO.SettingsDTO(isAutoJudgeEnabled = true),
                    members =
                        listOf(
                            UpdateContestInputDTO.MemberDTO(
                                id = UUID.randomUUID(),
                                type = Member.Type.CONTESTANT,
                                name = "Test User",
                                login = "test_user",
                                password = "password123",
                            ),
                        ),
                    problems =
                        listOf(
                            UpdateContestInputDTO.ProblemDTO(
                                id = UUID.randomUUID(),
                                letter = 'A',
                                title = "Test Problem",
                                description = AttachmentInputDTO(id = UUID.randomUUID()),
                                timeLimit = 1000,
                                memoryLimit = 256,
                                testCases = AttachmentInputDTO(id = UUID.randomUUID()),
                            ),
                        ),
                )

            test("should throw ForbiddenException when input has ROOT members") {
                val invalidInputDTO = inputDTO.copy(members = listOf(inputDTO.members[0].copy(type = Member.Type.ROOT)))

                shouldThrow<ForbiddenException> {
                    sut.update(invalidInputDTO)
                }.message shouldBe "Contest cannot have ROOT members"
            }

            test("should throw NotFoundException when contest does not exist") {
                every { contestRepository.findEntityById(inputDTO.id) } returns null

                shouldThrow<NotFoundException> {
                    sut.update(inputDTO)
                }.message shouldBe "Could not find contest with id = ${inputDTO.id}"
            }

            test("should throw ForbiddenException when contest has finished") {
                val contest = ContestMockBuilder.build(endAt = OffsetDateTime.now().minusHours(1))
                every { contestRepository.findEntityById(inputDTO.id) } returns contest

                shouldThrow<ForbiddenException> {
                    sut.update(inputDTO)
                }.message shouldBe "Contest has already finished and cannot be updated"
            }

            test("should throw ForbiddenException when contest has started and startAt is being updated") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
                every { contestRepository.findEntityById(inputDTO.id) } returns contest

                shouldThrow<ForbiddenException> {
                    sut.update(inputDTO.copy(startAt = OffsetDateTime.now().plusHours(1)))
                }.message shouldBe "Contest has already started and cannot have its start time updated"
            }

            test("should throw BusinessException when contest startAt is in the past") {
                val contest = ContestMockBuilder.build()
                every { contestRepository.findEntityById(inputDTO.id) } returns contest

                shouldThrow<BusinessException> {
                    sut.update(inputDTO.copy(startAt = OffsetDateTime.now().minusHours(1)))
                }.message shouldBe "Contest start time must be in the future"
            }

            test("should throw ConflictException when contest with same slug already exists") {
                val existingContest = ContestMockBuilder.build(slug = inputDTO.slug)
                every { contestRepository.findEntityById(inputDTO.id) } returns ContestMockBuilder.build()
                every { contestRepository.findBySlug(inputDTO.slug) } returns existingContest

                shouldThrow<ConflictException> {
                    sut.update(inputDTO)
                }.message shouldBe "Contest with slug '${inputDTO.slug}' already exists"
            }

            test("should throw NotFoundException when problem description attachment does not exist") {
                val contest =
                    ContestMockBuilder.build(
                        members = listOf(MemberMockBuilder.build(id = inputDTO.members[0].id!!)),
                        problems = listOf(ProblemMockBuilder.build(id = inputDTO.problems[0].id!!)),
                    )
                every { contestRepository.findEntityById(inputDTO.id) } returns contest
                every { contestRepository.findBySlug(inputDTO.slug) } returns null
                every { attachmentRepository.findEntityById(inputDTO.problems[0].description.id) } returns null

                shouldThrow<NotFoundException> {
                    sut.update(inputDTO)
                }.message shouldBe "Could not find description attachment with id: ${inputDTO.problems[0].description.id}"
            }

            test("should throw NotFoundException when problem test cases attachment does not exist") {
                val contest =
                    ContestMockBuilder.build(
                        members = listOf(MemberMockBuilder.build(id = inputDTO.members[0].id!!)),
                        problems = listOf(ProblemMockBuilder.build(id = inputDTO.problems[0].id!!)),
                    )
                every { contestRepository.findEntityById(inputDTO.id) } returns contest
                every { contestRepository.findBySlug(inputDTO.slug) } returns null
                every { attachmentRepository.findEntityById(inputDTO.problems[0].description.id) } returns
                    AttachmentMockBuilder.build()
                every { attachmentRepository.findEntityById(inputDTO.problems[0].testCases.id) } returns null

                shouldThrow<NotFoundException> {
                    sut.update(inputDTO)
                }.message shouldBe "Could not find testCases attachment with id: ${inputDTO.problems[0].testCases.id}"
            }

            test("should update contest successfully") {
                val inputMemberToCreate = inputDTO.members[0].copy(id = null)
                val inputProblemToCreate = inputDTO.problems[0].copy(id = null)

                val inputMemberToUpdateMinimum = inputDTO.members[0].copy(id = UUID.randomUUID(), password = null)
                val inputProblemToUpdateMinimum = inputDTO.problems[0].copy(id = UUID.randomUUID())
                val inputMemberToUpdateFull = inputDTO.members[0].copy(id = UUID.randomUUID(), password = "newPassword")
                val inputProblemToUpdateFull =
                    inputDTO.problems[0].copy(
                        id = UUID.randomUUID(),
                        description = AttachmentInputDTO(id = UUID.randomUUID()),
                        testCases = AttachmentInputDTO(id = UUID.randomUUID()),
                    )

                val memberToUpdateMinimum = MemberMockBuilder.build(id = inputMemberToUpdateMinimum.id!!)
                val problemToUpdateMinimum =
                    ProblemMockBuilder.build(
                        id = inputProblemToUpdateMinimum.id!!,
                        description = AttachmentMockBuilder.build(id = inputProblemToUpdateMinimum.description.id),
                        testCases = AttachmentMockBuilder.build(id = inputProblemToUpdateMinimum.testCases.id),
                    )
                val memberToUpdateFull = MemberMockBuilder.build(id = inputMemberToUpdateFull.id!!)
                val problemToUpdateFull = ProblemMockBuilder.build(id = inputProblemToUpdateFull.id!!)

                val memberToDelete = MemberMockBuilder.build()
                val problemToDelete = ProblemMockBuilder.build()

                val contest =
                    ContestMockBuilder.build(
                        members = listOf(memberToUpdateMinimum, memberToUpdateFull, memberToDelete),
                        problems = listOf(problemToUpdateMinimum, problemToUpdateFull, problemToDelete),
                    )
                every { contestRepository.findEntityById(inputDTO.id) } returns contest
                every { contestRepository.findBySlug(inputDTO.slug) } returns null
                every { hashAdapter.hash(any()) } returns "hashedPassword"
                val descriptionAttachment = AttachmentMockBuilder.build()
                val testCasesAttachment = AttachmentMockBuilder.build()
                every { attachmentRepository.findEntityById(inputProblemToCreate.description.id) } returns
                    descriptionAttachment
                every { attachmentRepository.findEntityById(inputProblemToCreate.testCases.id) } returns testCasesAttachment
                every { attachmentRepository.findEntityById(inputProblemToUpdateFull.description.id) } returns
                    descriptionAttachment
                every { attachmentRepository.findEntityById(inputProblemToUpdateFull.testCases.id) } returns
                    testCasesAttachment
                every { contestRepository.save(any<Contest>()) } answers { firstArg() }

                sut.update(
                    inputDTO.copy(
                        members = listOf(inputMemberToCreate, inputMemberToUpdateMinimum, inputMemberToUpdateFull),
                        problems = listOf(inputProblemToCreate, inputProblemToUpdateMinimum, inputProblemToUpdateFull),
                    ),
                )

                verify { deleteContestService.deleteMembers(listOf(memberToDelete)) }
                verify { deleteContestService.deleteProblems(listOf(problemToDelete)) }

                contest.slug shouldBe inputDTO.slug
                contest.title shouldBe inputDTO.title
                contest.languages shouldBe inputDTO.languages
                contest.startAt shouldBe inputDTO.startAt
                contest.endAt shouldBe inputDTO.endAt
                contest.settings.isAutoJudgeEnabled shouldBe inputDTO.settings.isAutoJudgeEnabled

                contest.members.size shouldBe 3
                contest.members[1].id shouldBe inputMemberToUpdateMinimum.id
                contest.members[1].type shouldBe inputMemberToUpdateMinimum.type
                contest.members[1].name shouldBe inputMemberToUpdateMinimum.name
                contest.members[1].login shouldBe inputMemberToUpdateMinimum.login
                contest.members[1].password shouldBe memberToUpdateMinimum.password
                contest.members[2].id shouldBe inputMemberToUpdateFull.id
                contest.members[2].type shouldBe inputMemberToUpdateFull.type
                contest.members[2].name shouldBe inputMemberToUpdateFull.name
                contest.members[2].login shouldBe inputMemberToUpdateFull.login
                contest.members[2].password shouldBe "hashedPassword"

                contest.problems.size shouldBe 3
                contest.problems[1].id shouldBe inputProblemToUpdateMinimum.id
                contest.problems[1].letter shouldBe inputProblemToUpdateMinimum.letter
                contest.problems[1].title shouldBe inputProblemToUpdateMinimum.title
                contest.problems[1].description shouldBe problemToUpdateMinimum.description
                contest.problems[1].timeLimit shouldBe problemToUpdateMinimum.timeLimit
                contest.problems[1].memoryLimit shouldBe problemToUpdateMinimum.memoryLimit
                contest.problems[1].testCases shouldBe problemToUpdateMinimum.testCases
                contest.problems[2].id shouldBe inputProblemToUpdateFull.id
                contest.problems[2].letter shouldBe inputProblemToUpdateFull.letter
                contest.problems[2].title shouldBe inputProblemToUpdateFull.title
                contest.problems[2].description shouldBe descriptionAttachment
                contest.problems[2].timeLimit shouldBe inputProblemToUpdateFull.timeLimit
                contest.problems[2].memoryLimit shouldBe inputProblemToUpdateFull.memoryLimit
                contest.problems[2].testCases shouldBe testCasesAttachment

                verify { testCasesValidator.validate(testCasesAttachment) }
                verify { contestRepository.save(contest) }
            }
        }

        context("forceStart") {
            test("should throw NotFoundException when contest does not exist") {
                val contestId = UUID.randomUUID()
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.forceStart(contestId)
                }.message shouldBe "Could not find contest with id = $contestId"
            }

            test("should start the contest successfully") {
                val contestId = UUID.randomUUID()
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                every { contestRepository.findEntityById(contestId) } returns contest
                every { contestRepository.save(any<Contest>()) } answers { firstArg() }

                sut.forceStart(contestId)

                verify { contestRepository.save(contest) }
                contest.startAt shouldBe now
            }

            test("should throw ForbiddenException when contest has already started") {
                val contestId = UUID.randomUUID()
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
                every { contestRepository.findEntityById(contestId) } returns contest

                shouldThrow<ForbiddenException> {
                    sut.forceStart(contestId)
                }.message shouldBe "Contest with id: $contestId has already started"
            }
        }

        context("forceEnd") {
            test("should throw NotFoundException when contest does not exist") {
                val contestId = UUID.randomUUID()
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.forceEnd(contestId)
                }.message shouldBe "Could not find contest with id = $contestId"
            }

            test("should throw ForbiddenException when contest is not active") {
                val contestId = UUID.randomUUID()
                val contest = ContestMockBuilder.build(endAt = OffsetDateTime.now().minusHours(1))
                every { contestRepository.findEntityById(contestId) } returns contest

                shouldThrow<ForbiddenException> {
                    sut.forceEnd(contestId)
                }.message shouldBe "Contest with id: $contestId is not active"
            }

            test("should end the contest successfully") {
                val contestId = UUID.randomUUID()
                val contest =
                    ContestMockBuilder.build(
                        startAt = OffsetDateTime.now().minusHours(1),
                        endAt = OffsetDateTime.now().plusHours(1),
                    )
                every { contestRepository.findEntityById(contestId) } returns contest
                every { contestRepository.save(any<Contest>()) } answers { firstArg() }

                sut.forceEnd(contestId)

                verify { contestRepository.save(contest) }
                contest.endAt shouldBe now
            }
        }
    })
