package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.util.TestCasesValidator
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.Hasher
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.dto.input.attachment.AttachmentInputDTO
import com.forsetijudge.core.port.dto.input.contest.UpdateContestInputDTO
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.verify
import java.time.OffsetDateTime

class UpdateContestServiceTest :
    FunSpec({
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val hasher = mockk<Hasher>(relaxed = true)
        val deleteContestService = mockk<DeleteContestService>(relaxed = true)
        val testCasesValidator = mockk<TestCasesValidator>(relaxed = true)

        val sut =
            UpdateContestService(
                attachmentRepository,
                contestRepository,
                hasher,
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
                    id = UuidCreator.getTimeOrderedEpoch(),
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.PYTHON_312),
                    startAt = OffsetDateTime.now().plusHours(1),
                    endAt = OffsetDateTime.now().plusHours(2),
                    settings = UpdateContestInputDTO.SettingsDTO(isAutoJudgeEnabled = true),
                    members =
                        listOf(
                            UpdateContestInputDTO.MemberDTO(
                                id = UuidCreator.getTimeOrderedEpoch(),
                                type = Member.Type.CONTESTANT,
                                name = "Test User",
                                login = "test_user",
                                password = "password123",
                            ),
                        ),
                    problems =
                        listOf(
                            UpdateContestInputDTO.ProblemDTO(
                                id = UuidCreator.getTimeOrderedEpoch(),
                                letter = 'A',
                                title = "Test Problem",
                                description = AttachmentInputDTO(id = UuidCreator.getTimeOrderedEpoch()),
                                timeLimit = 1000,
                                memoryLimit = 256,
                                testCases = AttachmentInputDTO(id = UuidCreator.getTimeOrderedEpoch()),
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

            test("should throw ForbiddenException when problem description attachment has wrong context") {
                val contest =
                    ContestMockBuilder.build(
                        members = listOf(MemberMockBuilder.build(id = inputDTO.members[0].id!!)),
                        problems = listOf(ProblemMockBuilder.build(id = inputDTO.problems[0].id!!)),
                    )
                val descriptionAttachment = AttachmentMockBuilder.build(context = Attachment.Context.SUBMISSION_CODE)
                every { contestRepository.findEntityById(inputDTO.id) } returns contest
                every { contestRepository.findBySlug(inputDTO.slug) } returns null
                every { attachmentRepository.findEntityById(inputDTO.problems[0].description.id) } returns
                    descriptionAttachment

                shouldThrow<ForbiddenException> {
                    sut.update(inputDTO)
                }.message shouldBe "Attachment with id: ${descriptionAttachment.id} is not a valid problem description"
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
                    AttachmentMockBuilder.build(context = Attachment.Context.PROBLEM_DESCRIPTION)
                every { attachmentRepository.findEntityById(inputDTO.problems[0].testCases.id) } returns null

                shouldThrow<NotFoundException> {
                    sut.update(inputDTO)
                }.message shouldBe "Could not find testCases attachment with id: ${inputDTO.problems[0].testCases.id}"
            }

            test("should throw ForbiddenException when problem test cases attachment has wrong context") {
                val contest =
                    ContestMockBuilder.build(
                        members = listOf(MemberMockBuilder.build(id = inputDTO.members[0].id!!)),
                        problems = listOf(ProblemMockBuilder.build(id = inputDTO.problems[0].id!!)),
                    )
                val testCasesAttachment = AttachmentMockBuilder.build(context = Attachment.Context.SUBMISSION_CODE)
                every { contestRepository.findEntityById(inputDTO.id) } returns contest
                every { contestRepository.findBySlug(inputDTO.slug) } returns null
                every { attachmentRepository.findEntityById(inputDTO.problems[0].description.id) } returns
                    AttachmentMockBuilder.build(context = Attachment.Context.PROBLEM_DESCRIPTION)
                every { attachmentRepository.findEntityById(inputDTO.problems[0].testCases.id) } returns
                    testCasesAttachment

                shouldThrow<ForbiddenException> {
                    sut.update(inputDTO)
                }.message shouldBe "Attachment with id: ${testCasesAttachment.id} is not a valid problem test cases"
            }

            test("should update contest successfully") {
                val inputMemberToCreate = inputDTO.members[0].copy(id = null)
                val inputProblemToCreate = inputDTO.problems[0].copy(id = null)

                val inputMemberToUpdateMinimum =
                    inputDTO.members[0].copy(
                        id = UuidCreator.getTimeOrderedEpoch(),
                        password = null,
                    )
                val inputProblemToUpdateMinimum = inputDTO.problems[0].copy(id = UuidCreator.getTimeOrderedEpoch())
                val inputMemberToUpdateFull =
                    inputDTO.members[0].copy(
                        id = UuidCreator.getTimeOrderedEpoch(),
                        password = "newPassword",
                    )
                val inputProblemToUpdateFull =
                    inputDTO.problems[0].copy(
                        id = UuidCreator.getTimeOrderedEpoch(),
                        description = AttachmentInputDTO(id = UuidCreator.getTimeOrderedEpoch()),
                        testCases = AttachmentInputDTO(id = UuidCreator.getTimeOrderedEpoch()),
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
                every { hasher.hash(any()) } returns "hashedPassword"
                val descriptionAttachment = AttachmentMockBuilder.build(context = Attachment.Context.PROBLEM_DESCRIPTION)
                val testCasesAttachment = AttachmentMockBuilder.build(context = Attachment.Context.PROBLEM_TEST_CASES)
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
                val contestId = UuidCreator.getTimeOrderedEpoch()
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.forceStart(contestId)
                }.message shouldBe "Could not find contest with id = $contestId"
            }

            test("should start the contest successfully") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                every { contestRepository.findEntityById(contestId) } returns contest
                every { contestRepository.save(any<Contest>()) } answers { firstArg() }

                sut.forceStart(contestId)

                verify { contestRepository.save(contest) }
                contest.startAt shouldBe now
            }

            test("should throw ForbiddenException when contest has already started") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
                every { contestRepository.findEntityById(contestId) } returns contest

                shouldThrow<ForbiddenException> {
                    sut.forceStart(contestId)
                }.message shouldBe "Contest with id: $contestId has already started"
            }
        }

        context("forceEnd") {
            test("should throw NotFoundException when contest does not exist") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.forceEnd(contestId)
                }.message shouldBe "Could not find contest with id = $contestId"
            }

            test("should throw ForbiddenException when contest is not active") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
                val contest = ContestMockBuilder.build(endAt = OffsetDateTime.now().minusHours(1))
                every { contestRepository.findEntityById(contestId) } returns contest

                shouldThrow<ForbiddenException> {
                    sut.forceEnd(contestId)
                }.message shouldBe "Contest with id: $contestId is not active"
            }

            test("should end the contest successfully") {
                val contestId = UuidCreator.getTimeOrderedEpoch()
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
