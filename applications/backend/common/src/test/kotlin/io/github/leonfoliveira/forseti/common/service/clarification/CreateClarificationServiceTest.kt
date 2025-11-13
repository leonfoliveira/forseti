package io.github.leonfoliveira.forseti.common.service.clarification

import io.github.leonfoliveira.forseti.common.domain.entity.Clarification
import io.github.leonfoliveira.forseti.common.domain.entity.Member
import io.github.leonfoliveira.forseti.common.domain.event.ClarificationCreatedEvent
import io.github.leonfoliveira.forseti.common.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.domain.exception.NotFoundException
import io.github.leonfoliveira.forseti.common.mock.entity.ContestMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.forseti.common.repository.ClarificationRepository
import io.github.leonfoliveira.forseti.common.repository.ContestRepository
import io.github.leonfoliveira.forseti.common.repository.MemberRepository
import io.github.leonfoliveira.forseti.common.service.dto.input.clarification.CreateClarificationInputDTO
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

class CreateClarificationServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val clarificationRepository = mockk<ClarificationRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            CreateClarificationService(
                contestRepository,
                memberRepository,
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

            test("should throw NotFoundException when member does not exist in contest") {
                val contest = ContestMockBuilder.build(id = contestId)
                every { contestRepository.findById(contestId) } returns Optional.of(contest)
                every { memberRepository.findById(memberId) } returns Optional.empty()

                shouldThrow<NotFoundException> {
                    sut.create(contestId, memberId, input)
                }.message shouldBe "Could not find member with id $memberId"
            }

            test("should throw ForbiddenException when contestant tries to create clarification with parent") {
                val member = MemberMockBuilder.build(id = memberId, type = Member.Type.CONTESTANT)
                val contest = ContestMockBuilder.build(id = contestId)
                every { contestRepository.findById(contestId) } returns Optional.of(contest)
                every { memberRepository.findById(memberId) } returns Optional.of(member)

                val inputWithParent = input.copy(parentId = UUID.randomUUID())
                shouldThrow<ForbiddenException> {
                    sut.create(contestId, memberId, inputWithParent)
                }.message shouldBe "Contestants cannot create clarifications with a parent"
            }

            listOf(
                Member.Type.JUDGE,
                Member.Type.ADMIN,
            ).forEach { type ->
                test("should throw ForbiddenException when $type tries to create clarification without parent") {
                    val member = MemberMockBuilder.build(id = memberId, type = type)
                    val contest =
                        ContestMockBuilder.build(
                            id = contestId,
                            startAt = OffsetDateTime.now().minusHours(1),
                            members = listOf(member),
                        )
                    every { contestRepository.findById(contestId) } returns Optional.of(contest)
                    every { memberRepository.findById(memberId) } returns Optional.of(member)

                    shouldThrow<ForbiddenException> {
                        sut.create(contestId, memberId, input)
                    }.message shouldBe "$type members cannot create clarifications without a parent"
                }
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
                every { memberRepository.findById(memberId) } returns Optional.of(member)

                val inputWithProblem = input.copy(problemId = UUID.randomUUID())
                shouldThrow<NotFoundException> {
                    sut.create(contestId, memberId, inputWithProblem)
                }.message shouldBe "Could not find problem with id ${inputWithProblem.problemId} in contest $contestId"
            }

            test("should throw NotFoundException when parent clarification does not exist") {
                val member = MemberMockBuilder.build(id = memberId, type = Member.Type.JUDGE)
                val contest =
                    ContestMockBuilder.build(
                        id = contestId,
                        startAt = OffsetDateTime.now().minusHours(1),
                        members = listOf(member),
                    )
                every { contestRepository.findById(contestId) } returns Optional.of(contest)
                every { memberRepository.findById(memberId) } returns Optional.of(member)

                val inputWithParent = input.copy(parentId = UUID.randomUUID())
                every { clarificationRepository.findById(inputWithParent.parentId!!) } returns Optional.empty()

                shouldThrow<NotFoundException> {
                    sut.create(contestId, memberId, inputWithParent)
                }.message shouldBe "Could not find parent announcement with id ${inputWithParent.parentId}"
            }

            test("should create clarification successfully") {
                val member = MemberMockBuilder.build(id = memberId, type = Member.Type.CONTESTANT)
                val contest =
                    ContestMockBuilder.build(
                        id = contestId,
                        startAt = OffsetDateTime.now().minusHours(1),
                        members = listOf(member),
                    )
                every { contestRepository.findById(contestId) } returns Optional.of(contest)
                every { memberRepository.findById(memberId) } returns Optional.of(member)
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
