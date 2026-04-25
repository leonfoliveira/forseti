package com.forsetijudge.core.application.service.ticket

import com.forsetijudge.core.application.helper.IdGenerator
import com.forsetijudge.core.application.helper.outbox.OutboxEventPublisher
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.MemberMockBuilder
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.entity.TicketMockBuilder
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContextMockBuilder
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import com.forsetijudge.core.port.driving.usecase.external.ticket.UpdateTicketStatusUseCase
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.io.Serializable

class UpdateTicketStatusServiceTest :
    FunSpec({
        val ticketRepository = mockk<TicketRepository>(relaxed = true)
        val memberRepository = mockk<MemberRepository>(relaxed = true)
        val outboxEventPublisher = mockk<OutboxEventPublisher>(relaxed = true)

        val sut =
            UpdateTicketStatusService(
                ticketRepository = ticketRepository,
                memberRepository = memberRepository,
                outboxEventPublisher = outboxEventPublisher,
            )

        val contextContestId = IdGenerator.getUUID()
        val contextMemberId = IdGenerator.getUUID()

        beforeEach {
            clearAllMocks()
            ExecutionContextMockBuilder.build(contestId = contextContestId, memberId = contextMemberId)
        }

        val command =
            UpdateTicketStatusUseCase.Command(
                ticketId = IdGenerator.getUUID(),
                status = Ticket.Status.RESOLVED,
            )

        test("should throw NotFoundException if ticket does not exist") {
            every { ticketRepository.findByIdAndContestId(command.ticketId, contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        test("should throw NotFoundException if staff does not exist") {
            val ticket = TicketMockBuilder.build<Serializable>()
            every { ticketRepository.findByIdAndContestId(command.ticketId, contextContestId) } returns ticket
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns null

            shouldThrow<NotFoundException> { sut.execute(command) }
        }

        Member.Type.entries.filter { it !in setOf(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF) }.forEach {
            test("should throw ForbiddenException if member type is ${it.name}") {
                val ticket = TicketMockBuilder.build<Serializable>()
                val staff = MemberMockBuilder.build(contest = ticket.contest, type = it)
                every { ticketRepository.findByIdAndContestId(command.ticketId, contextContestId) } returns ticket
                every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns staff

                shouldThrow<ForbiddenException> { sut.execute(command) }
            }
        }

        test("should update ticket status successfully") {
            val ticket = TicketMockBuilder.build<Serializable>()
            val staff = MemberMockBuilder.build(contest = ticket.contest, type = Member.Type.STAFF)
            val command =
                UpdateTicketStatusUseCase.Command(
                    ticketId = IdGenerator.getUUID(),
                    status = Ticket.Status.REJECTED,
                )
            every { ticketRepository.findByIdAndContestId(command.ticketId, contextContestId) } returns ticket
            every { memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId) } returns staff
            every { ticketRepository.save(any()) } returnsArgument 0

            sut.execute(command)

            verify { ticketRepository.save(any()) }
            verify {
                outboxEventPublisher.publish(
                    match { it is TicketEvent.Updated && it.ticketId == ticket.id },
                )
            }
        }
    })
