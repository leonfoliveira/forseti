package com.forsetijudge.core.application.service.external.contest

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.application.util.TestCasesValidator
import com.forsetijudge.core.domain.entity.Attachment
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.domain.exception.ConflictException
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.Hasher
import com.forsetijudge.core.port.driven.repository.AttachmentRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driving.usecase.external.contest.UpdateContestUseCase
import com.forsetijudge.core.port.dto.command.AttachmentCommandDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime

class UpdateContestServiceTest :
    FunSpec({
        val attachmentRepository = mockk<AttachmentRepository>(relaxed = true)
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val problemRepository = mockk<ProblemRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val hasher = mockk<Hasher>(relaxed = true)
        val testCasesValidator = mockk<TestCasesValidator>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            UpdateContestService(
                attachmentRepository = attachmentRepository,
                contestRepository = contestRepository,
                problemRepository = problemRepository,
                memberRepository = memberRepository,
                hasher = hasher,
                testCasesValidator = testCasesValidator,
                applicationEventPublisher = applicationEventPublisher,
            )

        val now = OffsetDateTime.now()
        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
            ExecutionContextMockBuilder.build(
                contestId = contextContestId,
                memberId = contextMemberId,
                startAt = now,
            )
        }

        context("update") {
            val command =
                UpdateContestUseCase.Command(
                    slug = "test-contest",
                    title = "Test Contest",
                    languages = listOf(Submission.Language.PYTHON_312),
                    startAt = now.plusHours(1),
                    endAt = now.plusHours(2),
                    settings = UpdateContestUseCase.Command.Settings(isAutoJudgeEnabled = true),
                    members =
                        listOf(
                            UpdateContestUseCase.Command.Member(
                                id = IdGenerator.getUUID(),
                                type = Member.Type.CONTESTANT,
                                name = "Test User",
                                login = "test_user",
                                password = "password123",
                            ),
                        ),
                    problems =
                        listOf(
                            UpdateContestUseCase.Command.Problem(
                                id = IdGenerator.getUUID(),
                                letter = 'A',
                                color = "#FFFFFF",
                                title = "Test Problem",
                                description = AttachmentCommandDTO(id = IdGenerator.getUUID()),
                                timeLimit = 1000,
                                memoryLimit = 256,
                                testCases = AttachmentCommandDTO(id = IdGenerator.getUUID()),
                            ),
                        ),
                )

            test("should throw NotFoundException when contest does not exist") {
                every { contestRepository.findById(contextContestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.execute(command)
                }
            }

            test("should throw NotFoundException when member does not exist") {
                val contest = ContestMockBuilder.build()
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.execute(command)
                }
            }

            Member.Type.entries.filter { it !in setOf(Member.Type.ROOT, Member.Type.ADMIN) }.forEach { memberType ->
                test("should throw ForbiddenException when member has type ${memberType.name}") {
                    val contest = ContestMockBuilder.build()
                    val member = MemberMockBuilder.build(type = memberType, contest = contest)
                    every { contestRepository.findById(contextContestId) } returns contest
                    every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                    shouldThrow<ForbiddenException> {
                        sut.execute(command)
                    }
                }
            }

            test("should throw ForbiddenException when contest has ended") {
                val contest =
                    ContestMockBuilder.build(
                        startAt = now.minusHours(2),
                        endAt = now.minusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> {
                    sut.execute(command)
                }
            }

            test("should throw ForbiddenException when input has ROOT members") {
                val invalidInputDTO = command.copy(members = listOf(command.members[0].copy(type = Member.Type.ROOT)))
                val contest =
                    ContestMockBuilder.build(
                        endAt = now.minusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> {
                    sut.execute(invalidInputDTO)
                }
            }

            test("should throw ForbiddenException when contest has started and startAt is being updated") {
                val contest =
                    ContestMockBuilder.build(
                        startAt = now.minusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> {
                    sut.execute(command.copy(startAt = now.plusHours(1)))
                }
            }

            test("should throw BusinessException when contest startAt is in the past") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<BusinessException> {
                    sut.execute(command.copy(startAt = now.minusHours(1)))
                }
            }

            test("should throw BusinessException when autoFreezeAt is before startAt") {
                val contest =
                    ContestMockBuilder.build(
                        endAt = now.minusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<BusinessException> {
                    sut.execute(
                        command.copy(
                            autoFreezeAt = now.plusMinutes(30),
                            startAt = now.plusHours(1),
                        ),
                    )
                }
            }

            test("should throw BusinessException when autoFreezeAt is after endAt") {
                val contest =
                    ContestMockBuilder.build(
                        endAt = now.minusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<BusinessException> {
                    sut.execute(
                        command.copy(
                            autoFreezeAt = now.plusHours(3),
                            endAt = now.plusHours(2),
                        ),
                    )
                }
            }

            test("should throw BusinessException when autoFreezeAt is in the past") {
                val contest =
                    ContestMockBuilder.build(
                        autoFreezeAt = null,
                        startAt = now.minusHours(1),
                        endAt = now.plusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<BusinessException> {
                    sut.execute(
                        command.copy(
                            autoFreezeAt = ExecutionContext.get().startedAt.minusMinutes(30),
                            startAt = contest.startAt,
                        ),
                    )
                }
            }

            test("should throw ConflictException when contest with same slug already exists") {
                val contest =
                    ContestMockBuilder.build(
                        id = contextContestId,
                        endAt = now.plusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { contestRepository.existsBySlugAndIdNot(command.slug, contest.id) } returns true

                shouldThrow<ConflictException> {
                    sut.execute(command)
                }
            }

            test("should throw NotFoundException when problem description attachment does not exist") {
                val contest =
                    ContestMockBuilder.build(
                        id = contextContestId,
                        members = listOf(MemberMockBuilder.build(id = command.members[0].id!!)),
                        problems = listOf(ProblemMockBuilder.build(id = command.problems[0].id!!)),
                        endAt = now.plusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { contestRepository.existsBySlugAndIdNot(command.slug, contextContestId) } returns false
                every { attachmentRepository.findByIdAndContestId(command.problems[0].description.id, contextContestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.execute(command)
                }
            }

            test("should throw ForbiddenException when problem description attachment has wrong context") {
                val contest =
                    ContestMockBuilder.build(
                        id = contextContestId,
                        members = listOf(MemberMockBuilder.build(id = command.members[0].id!!)),
                        problems = listOf(ProblemMockBuilder.build(id = command.problems[0].id!!)),
                        endAt = now.plusHours(1),
                    )
                val descriptionAttachment = AttachmentMockBuilder.build(context = Attachment.Context.SUBMISSION_CODE)
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { contestRepository.existsBySlugAndIdNot(command.slug, contextContestId) } returns false
                every { attachmentRepository.findByIdAndContestId(command.problems[0].description.id, contextContestId) } returns
                    descriptionAttachment

                shouldThrow<ForbiddenException> {
                    sut.execute(command)
                }
            }

            test("should throw NotFoundException when problem test cases attachment does not exist") {
                val contest =
                    ContestMockBuilder.build(
                        id = contextContestId,
                        members = listOf(MemberMockBuilder.build(id = command.members[0].id!!)),
                        problems = listOf(ProblemMockBuilder.build(id = command.problems[0].id!!)),
                        endAt = now.plusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { contestRepository.existsBySlugAndIdNot(command.slug, contextContestId) } returns false
                every { attachmentRepository.findByIdAndContestId(command.problems[0].description.id, contextContestId) } returns
                    AttachmentMockBuilder.build(context = Attachment.Context.PROBLEM_DESCRIPTION)
                every { attachmentRepository.findByIdAndContestId(command.problems[0].testCases.id, contextContestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.execute(command)
                }
            }

            test("should throw ForbiddenException when problem test cases attachment has wrong context") {
                val contest =
                    ContestMockBuilder.build(
                        id = contextContestId,
                        members = listOf(MemberMockBuilder.build(id = command.members[0].id!!)),
                        problems = listOf(ProblemMockBuilder.build(id = command.problems[0].id!!)),
                        endAt = now.plusHours(1),
                    )
                val testCasesAttachment = AttachmentMockBuilder.build(context = Attachment.Context.SUBMISSION_CODE)
                every { contestRepository.findById(contextContestId) } returns contest
                every { contestRepository.existsBySlugAndIdNot(command.slug, contextContestId) } returns false
                every { attachmentRepository.findByIdAndContestId(command.problems[0].description.id, contextContestId) } returns
                    AttachmentMockBuilder.build(context = Attachment.Context.PROBLEM_DESCRIPTION)
                every { attachmentRepository.findByIdAndContestId(command.problems[0].testCases.id, contextContestId) } returns
                    testCasesAttachment

                shouldThrow<ForbiddenException> {
                    sut.execute(command)
                }
            }

            test("should update contest successfully") {
                val inputMemberToCreate = command.members[0].copy(id = null)
                val inputProblemToCreate = command.problems[0].copy(id = null)

                val inputMemberToUpdateMinimum =
                    command.members[0].copy(
                        id = IdGenerator.getUUID(),
                        password = null,
                    )
                val inputProblemToUpdateMinimum = command.problems[0].copy(id = IdGenerator.getUUID())
                val inputMemberToUpdateFull =
                    command.members[0].copy(
                        id = IdGenerator.getUUID(),
                        password = "newPassword",
                    )
                val inputProblemToUpdateFull =
                    command.problems[0].copy(
                        id = IdGenerator.getUUID(),
                        description = AttachmentCommandDTO(id = IdGenerator.getUUID()),
                        testCases = AttachmentCommandDTO(id = IdGenerator.getUUID()),
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
                        id = contextContestId,
                        members = listOf(memberToUpdateMinimum, memberToUpdateFull, memberToDelete),
                        problems = listOf(problemToUpdateMinimum, problemToUpdateFull, problemToDelete),
                        endAt = now.plusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.ADMIN, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { contestRepository.existsBySlugAndIdNot(command.slug, contextContestId) } returns false
                every { hasher.hash(any()) } returns "hashedPassword"
                val descriptionAttachment =
                    AttachmentMockBuilder.build(
                        context = Attachment.Context.PROBLEM_DESCRIPTION,
                        isCommited = false,
                    )
                val testCasesAttachment = AttachmentMockBuilder.build(context = Attachment.Context.PROBLEM_TEST_CASES, isCommited = false)
                every { attachmentRepository.findByIdAndContestId(inputProblemToCreate.description.id, contextContestId) } returns
                    descriptionAttachment
                every { attachmentRepository.findByIdAndContestId(inputProblemToCreate.testCases.id, contextContestId) } returns
                    testCasesAttachment
                every { attachmentRepository.findByIdAndContestId(inputProblemToUpdateFull.description.id, contextContestId) } returns
                    descriptionAttachment
                every { attachmentRepository.findByIdAndContestId(inputProblemToUpdateFull.testCases.id, contextContestId) } returns
                    testCasesAttachment
                every { contestRepository.save(any<Contest>()) } answers { firstArg() }

                sut.execute(
                    command.copy(
                        members = listOf(inputMemberToCreate, inputMemberToUpdateMinimum, inputMemberToUpdateFull),
                        problems = listOf(inputProblemToCreate, inputProblemToUpdateMinimum, inputProblemToUpdateFull),
                    ),
                )

                verify { memberRepository.saveAll(listOf(memberToDelete)) }
                verify { problemRepository.saveAll(listOf(problemToDelete)) }
                memberToDelete.deletedAt shouldBe ExecutionContext.get().startedAt
                problemToDelete.deletedAt shouldBe ExecutionContext.get().startedAt

                contest.slug shouldBe command.slug
                contest.title shouldBe command.title
                contest.languages shouldBe command.languages
                contest.startAt shouldBe command.startAt
                contest.endAt shouldBe command.endAt
                contest.settings.isAutoJudgeEnabled shouldBe command.settings.isAutoJudgeEnabled

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
                contest.problems[1].color shouldBe inputProblemToUpdateMinimum.color.lowercase()
                contest.problems[1].title shouldBe inputProblemToUpdateMinimum.title
                contest.problems[1].description shouldBe problemToUpdateMinimum.description
                contest.problems[1].description.isCommited shouldBe true
                contest.problems[1].timeLimit shouldBe problemToUpdateMinimum.timeLimit
                contest.problems[1].memoryLimit shouldBe problemToUpdateMinimum.memoryLimit
                contest.problems[1].testCases shouldBe problemToUpdateMinimum.testCases
                contest.problems[1].testCases.isCommited shouldBe true
                contest.problems[2].id shouldBe inputProblemToUpdateFull.id
                contest.problems[2].letter shouldBe inputProblemToUpdateFull.letter
                contest.problems[2].color shouldBe inputProblemToUpdateFull.color.lowercase()
                contest.problems[2].title shouldBe inputProblemToUpdateFull.title
                contest.problems[2].description shouldBe descriptionAttachment
                contest.problems[2].description.isCommited shouldBe true
                contest.problems[2].timeLimit shouldBe inputProblemToUpdateFull.timeLimit
                contest.problems[2].memoryLimit shouldBe inputProblemToUpdateFull.memoryLimit
                contest.problems[2].testCases shouldBe testCasesAttachment
                contest.problems[2].testCases.isCommited shouldBe true

                problemToDelete.description.isCommited shouldBe false
                problemToDelete.testCases.isCommited shouldBe false

                verify { testCasesValidator.validate(testCasesAttachment) }
                verify { contestRepository.save(contest) }
                verify {
                    applicationEventPublisher.publishEvent(
                        match<ContestEvent.Updated> {
                            it.contest == contest
                        },
                    )
                }
            }
        }
    })
