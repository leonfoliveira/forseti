package com.forsetijudge.core.application.service.external.ticket

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.entity.ticket.TechnicalSupportTicket
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import com.forsetijudge.core.port.driving.usecase.external.ticket.CreateTicketUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.time.OffsetDateTime

class CreateTicketExternalServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val ticketRepository = mockk<TicketRepository>(relaxed = true)
        val submissionRepository = mockk<SubmissionRepository>(relaxed = true)
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)
        val objectMapper = jacksonObjectMapper()

        val sut =
            CreateTicketService(
                contestRepository,
                memberRepository,
                ticketRepository,
                submissionRepository,
                applicationEventPublisher,
                objectMapper,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId = contextContestId, memberId = contextMemberId)
        }

        context("create - SubmissionPrintTicket") {
            val submissionId = IdGenerator.getUUID()
            val attachmentId = IdGenerator.getUUID()

            val properties =
                mapOf(
                    "submissionId" to submissionId.toString(),
                    "attachmentId" to attachmentId.toString(),
                )

            val command =
                CreateTicketUseCase.Command(
                    type = Ticket.Type.SUBMISSION_PRINT,
                    properties = properties,
                )

            test("should throw NotFoundException if contest does not exists") {
                every { contestRepository.findById(contextContestId) } returns null

                shouldThrow<NotFoundException> { sut.execute(command) }
            }

            test("should throw NotFoundException if member does not exists") {
                val contest = ContestMockBuilder.build()
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

                shouldThrow<NotFoundException> { sut.execute(command) }
            }

            Member.Type.entries.filter { it != Member.Type.CONTESTANT }.forEach { memberType ->
                test("should throw ForbiddenException if member type is $memberType") {
                    val contest =
                        ContestMockBuilder.build(
                            startAt = OffsetDateTime.now().minusHours(1),
                            endAt = OffsetDateTime.now().plusHours(1),
                        )
                    val member = MemberMockBuilder.build(type = memberType, contest = contest)
                    every { contestRepository.findById(contextContestId) } returns contest
                    every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                    shouldThrow<ForbiddenException> { sut.execute(command) }
                }
            }

            test("should throw ForbiddenException if contest is not active") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> { sut.execute(command) }
            }

            test("should throw NotFoundException if submission does not exists") {
                val contest =
                    ContestMockBuilder.build(
                        startAt = OffsetDateTime.now().minusHours(1),
                        endAt = OffsetDateTime.now().plusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every {
                    submissionRepository.findByIdAndContestIdAndMemberId(
                        submissionId,
                        contest.id,
                        member.id,
                    )
                } returns null

                shouldThrow<NotFoundException> { sut.execute(command) }
            }

            test("should throw ForbiddenException if attachment does not belong to submission") {
                val contest =
                    ContestMockBuilder.build(
                        startAt = OffsetDateTime.now().minusHours(1),
                        endAt = OffsetDateTime.now().plusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                val submission = SubmissionMockBuilder.build()
                every {
                    submissionRepository.findByIdAndContestIdAndMemberId(
                        submissionId,
                        contest.id,
                        member.id,
                    )
                } returns submission

                shouldThrow<ForbiddenException> { sut.execute(command) }
            }

            test("should create submission print ticket successfully") {
                val contest =
                    ContestMockBuilder.build(
                        startAt = OffsetDateTime.now().minusHours(1),
                        endAt = OffsetDateTime.now().plusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                val submission = SubmissionMockBuilder.build(code = AttachmentMockBuilder.build(id = attachmentId))
                every {
                    submissionRepository.findByIdAndContestIdAndMemberId(
                        submissionId,
                        contest.id,
                        member.id,
                    )
                } returns submission
                every { ticketRepository.save(any()) } returnsArgument 0

                val result = sut.execute(command)

                result.contest shouldBe contest
                result.member shouldBe member
                result.type shouldBe Ticket.Type.SUBMISSION_PRINT
                result.properties shouldBe
                    mapOf(
                        "submissionId" to submissionId.toString(),
                        "attachmentId" to attachmentId.toString(),
                    )
                verify { ticketRepository.save(result) }
                verify { applicationEventPublisher.publishEvent(match<TicketEvent.Created> { it.payload == result }) }
            }
        }

        context("create - TechnicalSupportTicket") {
            val properties =
                mapOf(
                    "description" to "My submission is not being judged",
                )

            val command =
                CreateTicketUseCase.Command(
                    type = Ticket.Type.TECHNICAL_SUPPORT,
                    properties = properties,
                )

            test("should throw NotFoundException if contest does not exists") {
                every { contestRepository.findById(contextContestId) } returns null

                shouldThrow<NotFoundException> { sut.execute(command) }
            }

            test("should throw NotFoundException if member does not exists") {
                val contest = ContestMockBuilder.build()
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

                shouldThrow<NotFoundException> { sut.execute(command) }
            }

            test("should throw ForbiddenException if member cannot access not started contest") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> { sut.execute(command) }
            }

            test("should throw ForbiddenException if contest has ended") {
                val contest = ContestMockBuilder.build(endAt = OffsetDateTime.now().minusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> { sut.execute(command) }
            }

            test("should create technical support ticket successfully") {
                val contest =
                    ContestMockBuilder.build(
                        startAt = OffsetDateTime.now().minusHours(1),
                        endAt = OffsetDateTime.now().plusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { ticketRepository.save(any()) } returnsArgument 0

                val result = sut.execute(command)

                result.contest shouldBe contest
                result.member shouldBe member
                result.type shouldBe Ticket.Type.TECHNICAL_SUPPORT
                result.properties shouldBe
                    Ticket.Companion.getRawProperties(
                        objectMapper,
                        objectMapper.convertValue(command.properties, TechnicalSupportTicket.Properties::class.java),
                    )
                verify { ticketRepository.save(result) }
                verify { applicationEventPublisher.publishEvent(match<TicketEvent.Created> { it.payload == result }) }
            }
        }

        context("create - NonTechnicalSupportTicket") {
            val properties =
                mapOf(
                    "description" to "My submission is not being judged",
                )

            val command =
                CreateTicketUseCase.Command(
                    type = Ticket.Type.NON_TECHNICAL_SUPPORT,
                    properties = properties,
                )

            test("should throw NotFoundException if contest does not exists") {
                every { contestRepository.findById(contextContestId) } returns null

                shouldThrow<NotFoundException> { sut.execute(command) }
            }

            test("should throw NotFoundException if member does not exists") {
                val contest = ContestMockBuilder.build()
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

                shouldThrow<NotFoundException> { sut.execute(command) }
            }

            test("should throw ForbiddenException if member cannot access not started contest") {
                val contest = ContestMockBuilder.build(startAt = OffsetDateTime.now().plusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> { sut.execute(command) }
            }

            test("should throw ForbiddenException if contest has ended") {
                val contest = ContestMockBuilder.build(endAt = OffsetDateTime.now().minusHours(1))
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member

                shouldThrow<ForbiddenException> { sut.execute(command) }
            }

            test("should create technical support ticket successfully") {
                val contest =
                    ContestMockBuilder.build(
                        startAt = OffsetDateTime.now().minusHours(1),
                        endAt = OffsetDateTime.now().plusHours(1),
                    )
                val member = MemberMockBuilder.build(type = Member.Type.CONTESTANT, contest = contest)
                every { contestRepository.findById(contextContestId) } returns contest
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns member
                every { ticketRepository.save(any()) } returnsArgument 0

                val result = sut.execute(command)

                result.contest shouldBe contest
                result.member shouldBe member
                result.type shouldBe Ticket.Type.NON_TECHNICAL_SUPPORT
                result.properties shouldBe
                    Ticket.Companion.getRawProperties(
                        objectMapper,
                        objectMapper.convertValue(command.properties, TechnicalSupportTicket.Properties::class.java),
                    )
                verify { ticketRepository.save(result) }
                verify { applicationEventPublisher.publishEvent(match<TicketEvent.Created> { it.payload == result }) }
            }
        }
    })
