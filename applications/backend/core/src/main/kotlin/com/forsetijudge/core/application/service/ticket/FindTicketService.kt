package com.forsetijudge.core.application.service.ticket

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import com.forsetijudge.core.port.driving.usecase.ticket.FindTicketUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class FindTicketService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val ticketRepository: TicketRepository,
) : FindTicketUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Finds all tickets for a given contest.
     *
     * @param contestId The ID of the contest to find tickets for.
     * @param memberId The ID of the member requesting the tickets
     * @return A list of tickets for the specified contest.
     */
    @Transactional(readOnly = true)
    override fun findAllByContestId(
        contestId: UUID,
        memberId: UUID,
    ): List<Ticket<*>> {
        logger.info("Finding all tickets for contestId: $contestId")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id: $contestId")
        val member =
            memberRepository.findEntityById(memberId)
                ?: throw NotFoundException("Could not find member with id: $memberId")

        ContestAuthorizer(contest, member).checkMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.STAFF)

        val tickets = contest.tickets
        logger.info("Found ${tickets.size} tickets")
        return tickets
    }

    /**
     * Finds all tickets for a given member.
     *
     * @param contestId The ID of the contest to find tickets for.
     * @param memberId The ID of the member to find tickets for.
     * @return A list of tickets for the specified member.
     */
    @Transactional(readOnly = true)
    override fun findAllByContestIdAndMemberId(
        contestId: UUID,
        memberId: UUID,
    ): List<Ticket<*>> {
        logger.info("Finding all tickets for contestId: $contestId and memberId: $memberId")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id: $contestId")
        val member =
            memberRepository.findEntityById(memberId)
                ?: throw NotFoundException("Could not find member with id: $memberId")

        ContestAuthorizer(contest, member).checkContestStarted()

        val tickets = ticketRepository.findAllByContestIdAndMemberId(contestId, memberId)
        logger.info("Found ${tickets.size} tickets for member")
        return tickets
    }
}
