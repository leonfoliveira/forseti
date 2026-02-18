package com.forsetijudge.core.application.service.ticket

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.IdUtil
import com.forsetijudge.core.domain.entity.ContestMockBuilder
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.entity.TicketMockBuilder
import com.forsetijudge.core.domain.event.TicketUpdatedEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkConstructor
import io.mockk.verify
import org.springframework.context.ApplicationEventPublisher
import java.io.Serializable

class UpdateTicketServiceTest :
    FunSpec({
        val contestRepository = mockk<ContestRepository>()
        val memberRepository = mockk<MemberRepository>()
        val ticketRepository = mockk<TicketRepository>()
        val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

        val sut =
            UpdateTicketService(
                contestRepository,
                memberRepository,
                ticketRepository,
                applicationEventPublisher,
            )

        val contestAuthorizer = mockk<ContestAuthorizer>(relaxed = true)

        beforeEach {
            clearAllMocks()
            mockkConstructor(ContestAuthorizer::class)
            every { anyConstructed<ContestAuthorizer>().checkContestStarted() } returns contestAuthorizer
            every { anyConstructed<ContestAuthorizer>().checkMemberType(*anyVararg<Member.Type>()) } returns contestAuthorizer
        }

        context("updateStatus") {
            val contestId = IdUtil.getUUIDv7()
            val ticketId = IdUtil.getUUIDv7()
            val staffId = IdUtil.getUUIDv7()
            val newStatus = Ticket.Status.IN_PROGRESS

            test("should throw NotFoundException if contest does not exist") {
                every { contestRepository.findEntityById(contestId) } returns null

                shouldThrow<NotFoundException> { sut.updateStatus(contestId, ticketId, staffId, newStatus) }
            }

            test("should throw NotFoundException if staff member does not exist") {
                every { contestRepository.findEntityById(contestId) } returns ContestMockBuilder.build()
                every { memberRepository.findEntityById(staffId) } returns null

                shouldThrow<NotFoundException> { sut.updateStatus(contestId, ticketId, staffId, newStatus) }
            }

            test("should throw NotFoundException if ticket does not exist") {
                val contest = ContestMockBuilder.build(id = contestId)
                val staff = MemberMockBuilder.build(id = staffId, type = Member.Type.STAFF)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(staffId) } returns staff
                every { ticketRepository.findByIdAndContestId(ticketId, contestId) } returns null

                shouldThrow<NotFoundException> { sut.updateStatus(contestId, ticketId, staffId, newStatus) }
            }

            test("should update ticket status to IN_PROGRESS successfully") {
                val contest = ContestMockBuilder.build(id = contestId)
                val staff = MemberMockBuilder.build(id = staffId, type = Member.Type.STAFF)
                val ticket = TicketMockBuilder.build<Serializable>(id = ticketId, contest = contest, status = Ticket.Status.OPEN)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(staffId) } returns staff
                every { ticketRepository.findByIdAndContestId(ticketId, contestId) } returns ticket
                every { ticketRepository.save(any<Ticket<*>>()) } returns ticket

                val result = sut.updateStatus(contestId, ticketId, staffId, Ticket.Status.IN_PROGRESS)

                result.status shouldBe Ticket.Status.IN_PROGRESS
                result.staff shouldBe staff
                verify { anyConstructed<ContestAuthorizer>().checkMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF) }
                verify { ticketRepository.save(ticket as Ticket<*>) }
                verify { applicationEventPublisher.publishEvent(ofType<TicketUpdatedEvent>()) }
            }

            test("should update ticket status to RESOLVED successfully") {
                val contest = ContestMockBuilder.build(id = contestId)
                val staff = MemberMockBuilder.build(id = staffId, type = Member.Type.STAFF)
                val ticket = TicketMockBuilder.build<Serializable>(id = ticketId, contest = contest, status = Ticket.Status.IN_PROGRESS)
                every { contestRepository.findEntityById(contestId) } returns contest
                every { memberRepository.findEntityById(staffId) } returns staff
                every { ticketRepository.findByIdAndContestId(ticketId, contestId) } returns ticket
                every { ticketRepository.save(any<Ticket<*>>()) } returns ticket

                val result = sut.updateStatus(contestId, ticketId, staffId, Ticket.Status.RESOLVED)

                result.status shouldBe Ticket.Status.RESOLVED
                result.staff shouldBe staff
                verify { anyConstructed<ContestAuthorizer>().checkMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF) }
                verify { ticketRepository.save(ticket as Ticket<*>) }
                verify { applicationEventPublisher.publishEvent(ofType<TicketUpdatedEvent>()) }
            }
        }
    })
