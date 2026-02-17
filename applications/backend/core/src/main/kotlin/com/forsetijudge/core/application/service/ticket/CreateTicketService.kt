package com.forsetijudge.core.application.service.ticket

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
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
import com.forsetijudge.core.port.driving.usecase.ticket.CreateTicketUseCase
import com.forsetijudge.core.port.dto.input.ticket.CreateTicketInputDTO
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class CreateTicketService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val ticketRepository: TicketRepository,
    private val submissionRepository: SubmissionRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val objectMapper: ObjectMapper,
) : CreateTicketUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Creates a new ticket for a contest.
     *
     * @param contestId The UUID of the contest for which the ticket is being created.
     * @param memberID The UUID of the member creating the ticket.
     * @param inputDTO The input data transfer object containing the type and properties of the ticket.
     * @return The created Ticket entity.
     */
    @Transactional
    override fun create(
        contestId: UUID,
        memberId: UUID,
        inputDTO: CreateTicketInputDTO,
    ): Ticket<*> {
        logger.info("Creating ticket for contestId: $contestId, memberId: $memberId, type: ${inputDTO.type}")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id: $contestId")
        val member =
            memberRepository.findEntityById(memberId)
                ?: throw NotFoundException("Could not find member with id: $memberId")

        val ticket =
            when (inputDTO.type) {
                Ticket.Type.SUBMISSION_PRINT -> createSubmissionPrintTicket(contest, member, inputDTO)
                Ticket.Type.TECHNICAL_SUPPORT -> createTechnicalSupportTicket(contest, member, inputDTO)
                Ticket.Type.NON_TECHNICAL_SUPPORT -> createNonTechnicalSupportTicket(contest, member, inputDTO)
            }

        ticketRepository.save(ticket)
        applicationEventPublisher.publishEvent(TicketCreatedEvent(this, ticket))
        logger.info("Ticket created successfully with id: ${ticket.id}")
        return ticket
    }

    private fun createSubmissionPrintTicket(
        contest: Contest,
        member: Member,
        inputDTO: CreateTicketInputDTO,
    ): SubmissionPrintTicket {
        logger.info("Creating submission print ticket")

        ContestAuthorizer(contest, member)
            .checkContestStarted()
            .checkMemberType(Member.Type.CONTESTANT)

        val properties = objectMapper.convertValue(inputDTO.properties, SubmissionPrintTicket.Properties::class.java)

        val submission =
            submissionRepository.findEntityById(properties.submissionId)
                ?: throw NotFoundException("Could not find submission with id: ${properties.submissionId}")

        if (submission.contest != contest) {
            throw NotFoundException("Submission does not belong to this contest")
        }
        if (submission.member != member) {
            throw NotFoundException("Submission does not belong to this member")
        }
        if (submission.code.id != properties.attachment.id) {
            throw NotFoundException("Attachment does not belong to this submission")
        }

        return SubmissionPrintTicket(
            contest = contest,
            member = member,
            type = inputDTO.type,
            properties = properties,
        )
    }

    private fun createTechnicalSupportTicket(
        contest: Contest,
        member: Member,
        inputDTO: CreateTicketInputDTO,
    ): TechnicalSupportTicket {
        logger.info("Creating technical support ticket")

        ContestAuthorizer(contest, member)
            .checkContestStarted()
            .checkAnyMember()

        val properties = objectMapper.convertValue(inputDTO.properties, TechnicalSupportTicket.Properties::class.java)

        return TechnicalSupportTicket(
            contest = contest,
            member = member,
            type = inputDTO.type,
            properties = properties,
        )
    }

    private fun createNonTechnicalSupportTicket(
        contest: Contest,
        member: Member,
        inputDTO: CreateTicketInputDTO,
    ): NonTechnicalSupportTicket {
        logger.info("Creating non-technical support ticket")

        ContestAuthorizer(contest, member)
            .checkContestStarted()
            .checkAnyMember()

        val properties = objectMapper.convertValue(inputDTO.properties, NonTechnicalSupportTicket.Properties::class.java)

        return NonTechnicalSupportTicket(
            contest = contest,
            member = member,
            type = inputDTO.type,
            properties = properties,
        )
    }
}
