package com.forsetijudge.core.application.service.ticket

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.IdUtil
import com.forsetijudge.core.domain.entity.AttachmentMockBuilder
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.ProblemMockBuilder
import com.forsetijudge.core.domain.entity.SubmissionMockBuilder
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.entity.ticket.NonTechnicalSupportTicket
import com.forsetijudge.core.domain.entity.ticket.SubmissionPrintTicket
import com.forsetijudge.core.domain.entity.ticket.TechnicalSupportTicket
import com.forsetijudge.core.domain.event.TicketCreatedEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import com.forsetijudge.core.port.dto.input.ticket.CreateTicketInputDTO
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkConstructor
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher

class CreateTicketServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>()
        val memberRepository = mockk<MemberRepository>()
        val ticketRepository = mockk<TicketRepository>()
        val submissionRepository = mockk<SubmissionRepository>()
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

        val contestAuthorizer = mockk<ContestAuthorizer>(relaxed = true)

        beforeEach {
            clearAllMocks()
            mockkConstructor(ContestAuthorizer::class)
            every { anyConstructed<ContestAuthorizer>().checkContestStarted() } returns contestAuthorizer
            every { anyConstructed<ContestAuthorizer>().checkMemberType(*anyVararg<Member.Type>()) } returns contestAuthorizer
        }

        context("create - SubmissionPrintTicket") {
            val contestId = IdUtil.getUUIDv7()
            val memberId = IdUtil.getUUIDv7()
            val submissionId = IdUtil.getUUIDv7()
            val attachmentId = IdUtil.getUUIDv7()

            val properties =
                mapOf(
                    "submissionId" to submissionId.toString(),
                    "attachment" to
                        mapOf(
                            "id" to attachmentId.toString(),
                            "filename" to "solution.py",
                            "contentType" to "text/x-python",
                            "version" to 1L,
                        ),
                )

            val inputDTO =
                CreateTicketInputDTO(
                    type = Ticket.Type.SUBMISSION_PRINT,
                    properties = properties,
                )

            test("should throw NotFoundException if contest does not exist") {
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> { sut.create(contestId, memberId, inputDTO) }
            }

            test("should throw NotFoundException if member does not exist") {
                every { contestRepository.findEntityById(contestId) } returns ContestMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> { sut.create(contestId, memberId, inputDTO) }
            }

            test("should throw NotFoundException if submission does not exist") {
                val contest = ContestMockBuilder.build(id = contestId)
                val member = MemberMockBuilder.build(id = memberId)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member
                every { submissionRepository.findEntityById(submissionId) } returns null

                shouldThrow<NotFoundException> { sut.create(contestId, memberId, inputDTO) }
            }

            test("should throw NotFoundException if submission does not belong to contest") {
                val contest = ContestMockBuilder.build(id = contestId)
                val anotherContest = ContestMockBuilder.build()
                val member = MemberMockBuilder.build(id = memberId)
                val attachment = AttachmentMockBuilder.build(id = attachmentId)
                val submission =
                    SubmissionMockBuilder.build(
                        id = submissionId,
                        member = member,
                        code = attachment,
                        problem = ProblemMockBuilder.build(contest = anotherContest),
                    )
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member
                every { submissionRepository.findEntityById(submissionId) } returns submission

                shouldThrow<NotFoundException> { sut.create(contestId, memberId, inputDTO) }
            }

            test("should throw NotFoundException if submission does not belong to member") {
                val contest = ContestMockBuilder.build(id = contestId)
                val member = MemberMockBuilder.build(id = memberId)
                val anotherMember = MemberMockBuilder.build()
                val attachment = AttachmentMockBuilder.build(id = attachmentId)
                val submission =
                    SubmissionMockBuilder.build(
                        id = submissionId,
                        member = anotherMember,
                        code = attachment,
                        problem = ProblemMockBuilder.build(contest = contest),
                    )
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member
                every { submissionRepository.findEntityById(submissionId) } returns submission

                shouldThrow<NotFoundException> { sut.create(contestId, memberId, inputDTO) }
            }

            test("should throw NotFoundException if attachment does not belong to submission") {
                val contest = ContestMockBuilder.build(id = contestId)
                val member = MemberMockBuilder.build(id = memberId)
                val attachment = AttachmentMockBuilder.build()
                val submission =
                    SubmissionMockBuilder.build(
                        id = submissionId,
                        member = member,
                        code = attachment,
                        problem = ProblemMockBuilder.build(contest = contest),
                    )
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member
                every { submissionRepository.findEntityById(submissionId) } returns submission

                shouldThrow<NotFoundException> { sut.create(contestId, memberId, inputDTO) }
            }

            test("should create submission print ticket successfully") {
                val contest = ContestMockBuilder.build(id = contestId)
                val member = MemberMockBuilder.build(id = memberId)
                val attachment = AttachmentMockBuilder.build(id = attachmentId)
                val submission =
                    SubmissionMockBuilder.build(
                        id = submissionId,
                        member = member,
                        code = attachment,
                        problem = ProblemMockBuilder.build(contest = contest),
                    )
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member
                every { submissionRepository.findEntityById(submissionId) } returns submission
                every { ticketRepository.save(any<Ticket<*>>()) } answers { firstArg() }

                val result = sut.create(contestId, memberId, inputDTO)

                result.shouldBeInstanceOf<SubmissionPrintTicket>()
                result.contest shouldBe contest
                result.member shouldBe member
                result.type shouldBe Ticket.Type.SUBMISSION_PRINT
                result.status shouldBe Ticket.Status.OPEN
                result.properties.submissionId shouldBe submissionId
                result.properties.attachment.id shouldBe attachmentId
                verify { anyConstructed<ContestAuthorizer>().checkContestStarted() }
                verify { contestAuthorizer.checkMemberType(Member.Type.CONTESTANT) }
                verify { ticketRepository.save(any<SubmissionPrintTicket>()) }
                verify { applicationEventPublisher.publishEvent(ofType<TicketCreatedEvent>()) }
            }
        }

        context("create - TechnicalSupportTicket") {
            val contestId = IdUtil.getUUIDv7()
            val memberId = IdUtil.getUUIDv7()

            val properties = mapOf("description" to "My submission is not being judged")

            val inputDTO =
                CreateTicketInputDTO(
                    type = Ticket.Type.TECHNICAL_SUPPORT,
                    properties = properties,
                )

            test("should throw NotFoundException if contest does not exist") {
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> { sut.create(contestId, memberId, inputDTO) }
            }

            test("should throw NotFoundException if member does not exist") {
                every { contestRepository.findEntityById(contestId) } returns ContestMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> { sut.create(contestId, memberId, inputDTO) }
            }

            test("should create technical support ticket successfully") {
                val contest = ContestMockBuilder.build(id = contestId)
                val member = MemberMockBuilder.build(id = memberId)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member
                every { ticketRepository.save(any<Ticket<*>>()) } answers { firstArg() }

                val result = sut.create(contestId, memberId, inputDTO)

                result.shouldBeInstanceOf<TechnicalSupportTicket>()
                result.contest shouldBe contest
                result.member shouldBe member
                result.type shouldBe Ticket.Type.TECHNICAL_SUPPORT
                result.status shouldBe Ticket.Status.OPEN
                result.properties.description shouldBe "My submission is not being judged"
                verify { anyConstructed<ContestAuthorizer>().checkContestStarted() }
                verify { contestAuthorizer.checkMemberType(Member.Type.CONTESTANT, Member.Type.STAFF) }
                verify { ticketRepository.save(any<TechnicalSupportTicket>()) }
                verify { applicationEventPublisher.publishEvent(ofType<TicketCreatedEvent>()) }
            }
        }

        context("create - NonTechnicalSupportTicket") {
            val contestId = IdUtil.getUUIDv7()
            val memberId = IdUtil.getUUIDv7()

            val properties = mapOf("description" to "I need a bathroom break")

            val inputDTO =
                CreateTicketInputDTO(
                    type = Ticket.Type.NON_TECHNICAL_SUPPORT,
                    properties = properties,
                )

            test("should throw NotFoundException if contest does not exist") {
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> { sut.create(contestId, memberId, inputDTO) }
            }

            test("should throw NotFoundException if member does not exist") {
                every { contestRepository.findEntityById(contestId) } returns ContestMockBuilder.build()
                every { memberRepository.findEntityById(memberId) } returns null

                shouldThrow<NotFoundException> { sut.create(contestId, memberId, inputDTO) }
            }

            test("should create non-technical support ticket successfully") {
                val contest = ContestMockBuilder.build(id = contestId)
                val member = MemberMockBuilder.build(id = memberId)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(memberId) } returns member
                every { ticketRepository.save(any<Ticket<*>>()) } answers { firstArg() }

                val result = sut.create(contestId, memberId, inputDTO)

                result.shouldBeInstanceOf<NonTechnicalSupportTicket>()
                result.contest shouldBe contest
                result.member shouldBe member
                result.type shouldBe Ticket.Type.NON_TECHNICAL_SUPPORT
                result.status shouldBe Ticket.Status.OPEN
                result.properties.description shouldBe "I need a bathroom break"
                verify { anyConstructed<ContestAuthorizer>().checkContestStarted() }
                verify { contestAuthorizer.checkMemberType(Member.Type.CONTESTANT, Member.Type.STAFF) }
                verify { ticketRepository.save(any<NonTechnicalSupportTicket>()) }
                verify { applicationEventPublisher.publishEvent(ofType<TicketCreatedEvent>()) }
            }
        }
    })
