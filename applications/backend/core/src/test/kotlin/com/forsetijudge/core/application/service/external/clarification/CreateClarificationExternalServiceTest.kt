package com.forsetijudge.core.application.service.external.clarification

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ClarificationMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.ClarificationRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.driving.usecase.external.clarification.CreateClarificationUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime

class CreateClarificationExternalServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val problemRepository = mockk<ProblemRepository>(relaxed = true)
        val clarificationRepository = mockk<ClarificationRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            CreateClarificationService(
                contestRepository = contestRepository,
                memberRepository = memberRepository,
                problemRepository = problemRepository,
                clarificationRepository = clarificationRepository,
                applicationEventPublisher = applicationEventPublisher,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contextContestId, contextMemberId)
        }

        context("Without parent") {
            val command =
                CreateClarificationUseCase.Command(
                    text = "Clarification text",
                    problemId = IdGenerator.getUUID(),
                    parentId = null,
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

            Member.Type.entries.filter { it != Member.Type.CONTESTANT }.forEach { memberType ->
                test("Should throw ForbiddenException when member type is $memberType") {
                    val contest = ContestMockBuilder.build()
                    val member = MemberMockBuilder.build(type = memberType, contest = contest)
                    every { contestRepository.findById(contextContestId) } returns contest
                    every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                    shouldThrow<ForbiddenException> {
                        sut.execute(command)
                    }
                }
            }

            test("should throw ForbiddenException when contest has not started") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> {
                    sut.execute(command)
                }
            }

            test("should throw NotFoundException when problem does not exist") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { problemRepository.findByIdAndContestId(command.problemId!!, contest.id) } returns null

                shouldThrow<NotFoundException> {
                    sut.execute(command)
                }
            }

            test("should create clarification successfully") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().minusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                val problem = ProblemMockBuilder.build()
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { problemRepository.findByIdAndContestId(command.problemId!!, contest.id) } returns problem
                every { clarificationRepository.save(any()) } returnsArgument 0

                val result = sut.execute(command)

                verify { clarificationRepository.save(result) }
                result.contest shouldBe contest
                result.member shouldBe member
                result.text shouldBe command.text
                result.problem shouldBe problem
                result.parent shouldBe null
                verify {
                    applicationEventPublisher.publishEvent(
                        match<ClarificationEvent.Created> {
                            it.payload == result
                        },
                    )
                }
            }
        }

        context("With parent (answer)") {
            val command =
                CreateClarificationUseCase.Command(
                    text = "Clarification text",
                    problemId = null,
                    parentId = IdGenerator.getUUID(),
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

            test("should throw ForbiddenException when problemId is not null") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.JUDGE, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { clarificationRepository.findByIdAndContestId(command.parentId!!, contest.id) } returns null

                shouldThrow<ForbiddenException> {
                    sut.execute(command.copy(problemId = IdGenerator.getUUID()))
                }
            }

            Member.Type.entries.filter { it !in setOf(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE) }.forEach { memberType ->
                test("Should throw ForbiddenException when member type is $memberType") {
                    val contest = ContestMockBuilder.build()
                    val member = MemberMockBuilder.build(type = memberType, contest = contest)
                    every { contestRepository.findById(contextContestId) } returns contest
                    every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                    shouldThrow<ForbiddenException> {
                        sut.execute(command)
                    }
                }
            }

            test("should throw NotFoundException when parent clarification does not exist") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.JUDGE, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { clarificationRepository.findByIdAndContestId(command.parentId!!, contest.id) } returns null

                shouldThrow<NotFoundException> {
                    sut.execute(command)
                }
            }

            test("should create clarification successfully") {
                val contest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(type = Member.Type.JUDGE, contest = contest)
                val parent = ClarificationMockBuilder.build()
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { clarificationRepository.findByIdAndContestId(command.parentId!!, contest.id) } returns parent
                every { clarificationRepository.save(any()) } returnsArgument 0

                val result = sut.execute(command)

                verify { clarificationRepository.save(result) }
                result.contest shouldBe contest
                result.member shouldBe member
                result.text shouldBe command.text
                result.problem shouldBe null
                result.parent shouldBe parent
                verify {
                    applicationEventPublisher.publishEvent(
                        match<ClarificationEvent.Created> {
                            it.payload == result
                        },
                    )
                }
            }
        }
    })
