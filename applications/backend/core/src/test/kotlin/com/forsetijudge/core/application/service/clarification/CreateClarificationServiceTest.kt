package com.forsetijudge.core.application.service.clarification

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.event.ClarificationCreatedEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ClarificationRepository
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.ProblemRepository
import com.forsetijudge.core.port.dto.input.clarification.CreateClarificationInputDTO
import com.github.f4b6a3.uuid.UuidCreator
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkConstructor
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime

class CreateClarificationServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val problemRepository = mockk<ProblemRepository>(relaxed = true)
        val clarificationRepository = mockk<ClarificationRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            CreateClarificationService(
                contestRepository,
                memberRepository,
                problemRepository,
                clarificationRepository,
                applicationEventPublisher,
            )

        val contestAuthorizer = mockk<ContestAuthorizer>(relaxed = true)

        beforeEach {
            clearAllMocks()
            mockkConstructor(ContestAuthorizer::class)
            every { anyConstructed<ContestAuthorizer>().checkContestStarted() } returns contestAuthorizer
            every { anyConstructed<ContestAuthorizer>().checkMemberType() } returns contestAuthorizer
        }

        context("create") {
            val contestId = UuidCreator.getTimeOrderedEpoch()
            val memberId = UuidCreator.getTimeOrderedEpoch()
            val input =
                CreateClarificationInputDTO(
                    text = "Clarification text",
                )

            test("should throw NotFoundException when contest does not exist") {
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.create(contestId, memberId, input)
                }.message shouldBe "Could not find contest with id $contestId"
            }

            test("should throw NotFoundException when member does not exist in contest") {
                val contest = ContestMockBuilder.build(id = contestId)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> {
                    sut.create(contestId, memberId, input)
                }.message shouldBe "Could not find member with id $memberId"
            }

            test("should throw NotFoundException when problem does not exist in contest") {
                val member = MemberMockBuilder.build(id = memberId)
                val contest =
                    ContestMockBuilder.build(
                        id = contestId,
                        startAt = OffsetDateTime.now().minusHours(1),
                        endAt = OffsetDateTime.now().plusHours(1),
                        members = listOf(member),
                    )
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member

                val inputWithProblem = input.copy(problemId = UuidCreator.getTimeOrderedEpoch())
                every { problemRepository.findByIdAndContestId(inputWithProblem.problemId!!, contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.create(contestId, memberId, inputWithProblem)
                }.message shouldBe "Could not find problem with id ${inputWithProblem.problemId} in contest"
            }

            test("should throw NotFoundException when parent clarification does not exist") {
                val member = MemberMockBuilder.build(id = memberId, type = Member.Type.JUDGE)
                val contest =
                    ContestMockBuilder.build(
                        id = contestId,
                        startAt = OffsetDateTime.now().minusHours(1),
                        endAt = OffsetDateTime.now().plusHours(1),
                        members = listOf(member),
                    )
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member

                val inputWithParent = input.copy(parentId = UuidCreator.getTimeOrderedEpoch())
                every { clarificationRepository.findByIdAndContestId(inputWithParent.parentId!!, contestId) } returns null

                shouldThrow<NotFoundException> {
                    sut.create(contestId, memberId, inputWithParent)
                }.message shouldBe "Could not find parent clarification with id ${inputWithParent.parentId} in contest"
            }

            test("should create clarification successfully") {
                val member = MemberMockBuilder.build(id = memberId, type = Member.Type.CONTESTANT)
                val contest =
                    ContestMockBuilder.build(
                        id = contestId,
                        startAt = OffsetDateTime.now().minusHours(1),
                        endAt = OffsetDateTime.now().plusHours(1),
                        members = listOf(member),
                    )
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member
                every { clarificationRepository.save(any<Clarification>()) } answers { firstArg() }

                val clarification = sut.create(contestId, memberId, input)

                clarification.contest shouldBe contest
                clarification.member shouldBe member
                clarification.text shouldBe input.text
                clarification.problem shouldBe null
                clarification.parent shouldBe null
                verify { clarificationRepository.save(clarification) }
                val eventSlot = slot<ClarificationCreatedEvent>()
                verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
                eventSlot.captured.clarification shouldBe clarification
            }
        }
    })
