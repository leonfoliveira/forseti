package io.github.leonfoliveira.judge.common.service.clarification

import io.github.leonfoliveira.judge.common.domain.entity.Clarification
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.judge.common.domain.exception.NotFoundException
import io.github.leonfoliveira.judge.common.event.ClarificationEvent
import io.github.leonfoliveira.judge.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.judge.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.judge.common.repository.ClarificationRepository
import io.github.leonfoliveira.judge.common.repository.ContestRepository
import io.github.leonfoliveira.judge.common.service.dto.input.clarification.CreateClarificationInputDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime
import java.util.Optional
import java.util.UUID

class CreateClarificationServiceTest : FunSpec({
    val contestRepository = mockk<ContestRepository>(relaxed = true)
    val clarificationRepository = mockk<ClarificationRepository>(relaxed = true)
    val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

    val sut =
        CreateClarificationService(
            contestRepository,
            clarificationRepository,
            applicationEventPublisher,
        )

    beforeEach {
        clearAllMocks()
    }

    context("create") {
        val contestId = UUID.randomUUID()
        val memberId = UUID.randomUUID()
        val input =
            CreateClarificationInputDTO(
                text = "Clarification text",
            )

        test("should throw NotFoundException when contest does not exist") {
            every { contestRepository.findById(contestId) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.create(contestId, memberId, input)
            }.message shouldBe "Could not find contest with id $contestId"
        }

        test("should throw ForbiddenException when contest has not started") {
            val contest = ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().plusHours(1))
            every { contestRepository.findById(contestId) } returns Optional.of(contest)

            shouldThrow<ForbiddenException> {
                sut.create(contestId, memberId, input)
            }.message shouldBe "Contest with id $contestId has not started yet"
        }

        test("should throw NotFoundException when member does not exist in contest") {
            val contest = ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().minusHours(1), members = emptyList())
            every { contestRepository.findById(contestId) } returns Optional.of(contest)

            shouldThrow<NotFoundException> {
                sut.create(contestId, memberId, input)
            }.message shouldBe "Could not find member with id $memberId"
        }

        test("should throw ForbiddenException when contestant tries to create clarification with parent") {
            val member = MemberMockBuilder.build(id = memberId, type = Member.Type.CONTESTANT)
            val contest = ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().minusHours(1), members = listOf(member))
            every { contestRepository.findById(contestId) } returns Optional.of(contest)

            val inputWithParent = input.copy(parentId = UUID.randomUUID())
            shouldThrow<ForbiddenException> {
                sut.create(contestId, memberId, inputWithParent)
            }.message shouldBe "Contestants cannot create clarifications with a parent"
        }

        test("should throw ForbiddenException when jury tries to create clarification without parent") {
            val member = MemberMockBuilder.build(id = memberId, type = Member.Type.JURY)
            val contest = ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().minusHours(1), members = listOf(member))
            every { contestRepository.findById(contestId) } returns Optional.of(contest)

            shouldThrow<ForbiddenException> {
                sut.create(contestId, memberId, input)
            }.message shouldBe "Jury members cannot create clarifications without a parent"
        }

        test("should throw NotFoundException when problem does not exist in contest") {
            val member = MemberMockBuilder.build(id = memberId)
            val contest =
                ContestMockBuilder.build(
                    id = contestId,
                    startAt = OffsetDateTime.now().minusHours(1),
                    members = listOf(member),
                    problems = emptyList(),
                )
            every { contestRepository.findById(contestId) } returns Optional.of(contest)

            val inputWithProblem = input.copy(problemId = UUID.randomUUID())
            shouldThrow<NotFoundException> {
                sut.create(contestId, memberId, inputWithProblem)
            }.message shouldBe "Could not find problem with id ${inputWithProblem.problemId} in contest $contestId"
        }

        test("should throw NotFoundException when parent clarification does not exist") {
            val member = MemberMockBuilder.build(id = memberId, type = Member.Type.JURY)
            val contest = ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().minusHours(1), members = listOf(member))
            every { contestRepository.findById(contestId) } returns Optional.of(contest)

            val inputWithParent = input.copy(parentId = UUID.randomUUID())
            every { clarificationRepository.findById(inputWithParent.parentId!!) } returns Optional.empty()

            shouldThrow<NotFoundException> {
                sut.create(contestId, memberId, inputWithParent)
            }.message shouldBe "Could not find parent announcement with id ${inputWithParent.parentId}"
        }

        test("should create clarification successfully") {
            val member = MemberMockBuilder.build(id = memberId, type = Member.Type.CONTESTANT)
            val contest = ContestMockBuilder.build(id = contestId, startAt = OffsetDateTime.now().minusHours(1), members = listOf(member))
            every { contestRepository.findById(contestId) } returns Optional.of(contest)
            every { clarificationRepository.save(any<Clarification>()) } answers { firstArg() }

            val clarification = sut.create(contestId, memberId, input)

            clarification.contest shouldBe contest
            clarification.member shouldBe member
            clarification.text shouldBe input.text
            clarification.problem shouldBe null
            clarification.parent shouldBe null
            verify { clarificationRepository.save(clarification) }
            val eventSlot = slot<ClarificationEvent>()
            verify { applicationEventPublisher.publishEvent(capture(eventSlot)) }
            eventSlot.captured.clarification shouldBe clarification
        }
    }
})
