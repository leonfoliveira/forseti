package com.forsetijudge.core.application.service.external.ticket

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.Ticket
import com.forsetijudge.core.domain.entity.ticket.NonTechnicalSupportTicket
import com.forsetijudge.core.domain.entity.ticket.SubmissionPrintTicket
import com.forsetijudge.core.domain.entity.ticket.TechnicalSupportTicket
import com.forsetijudge.core.domain.event.TicketEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driven.repository.TicketRepository
import com.forsetijudge.core.port.driving.usecase.external.ticket.CreateTicketUseCase
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated
import java.util.UUID

@Service
@Validated
class CreateTicketService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val ticketRepository: TicketRepository,
    private val submissionRepository: SubmissionRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val objectMapper: ObjectMapper,
) : CreateTicketUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(command: CreateTicketUseCase.Command): Ticket<*> {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Creating ticket for contestId: $contextContestId, memberId: $contextMemberId, type: ${command.type}")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id: $contextContestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id: $contextMemberId in this contest")

        val ticket =
            when (command.type) {
                Ticket.Type.SUBMISSION_PRINT -> createSubmissionPrintTicket(contest, member, command)
                Ticket.Type.TECHNICAL_SUPPORT -> createTechnicalSupportTicket(contest, member, command)
                Ticket.Type.NON_TECHNICAL_SUPPORT -> createNonTechnicalSupportTicket(contest, member, command)
            }

        ticketRepository.save(ticket)
        applicationEventPublisher.publishEvent(TicketEvent.Created(ticket))

        logger.info("Ticket created successfully with id: ${ticket.id}")
        return ticket
    }

    private fun createSubmissionPrintTicket(
        contest: Contest,
        member: Member,
        command: CreateTicketUseCase.Command,
    ): SubmissionPrintTicket {
        logger.info("Creating submission print ticket")

        ContestAuthorizer(contest, member)
            .requireSettingSubmissionPrintTicketEnabled()
            .requireMemberType(Member.Type.CONTESTANT, Member.Type.UNOFFICIAL_CONTESTANT)
            .requireContestActive()

        val typedProperties =
            SubmissionPrintTicket.Properties(
                submissionId = UUID.fromString(command.properties["submissionId"] as String),
                attachmentId = UUID.fromString(command.properties["attachmentId"] as String),
            )

        val submission =
            submissionRepository.findByIdAndContestIdAndMemberId(typedProperties.submissionId, contest.id, member.id)
                ?: throw NotFoundException("Could not find submission with id: ${typedProperties.submissionId}")

        if (submission.code.id != typedProperties.attachmentId) {
            throw ForbiddenException("Attachment does not belong to this submission")
        }

        return SubmissionPrintTicket(
            contest = contest,
            member = member,
            type = command.type,
            properties = Ticket.Companion.getRawProperties(objectMapper, typedProperties),
        )
    }

    private fun createTechnicalSupportTicket(
        contest: Contest,
        member: Member,
        command: CreateTicketUseCase.Command,
    ): TechnicalSupportTicket {
        logger.info("Creating technical support ticket")

        ContestAuthorizer(contest, member)
            .requireSettingTechnicalSupportTicketEnabled()
            .or({ it.requireMemberCanAccessNotStartedContest() }, { it.requireContestStarted() })
            .requireContestNotEnded()
            .throwIfErrors()

        val typedProperties =
            TechnicalSupportTicket.Properties(
                description = command.properties["description"] as String,
            )

        return TechnicalSupportTicket(
            contest = contest,
            member = member,
            type = command.type,
            properties = Ticket.Companion.getRawProperties(objectMapper, typedProperties),
        )
    }

    private fun createNonTechnicalSupportTicket(
        contest: Contest,
        member: Member,
        command: CreateTicketUseCase.Command,
    ): NonTechnicalSupportTicket {
        logger.info("Creating non-technical support ticket")

        ContestAuthorizer(contest, member)
            .requireSettingNonTechnicalSupportTicketEnabled()
            .or({ it.requireMemberCanAccessNotStartedContest() }, { it.requireContestStarted() })
            .requireContestNotEnded()
            .throwIfErrors()

        val typedProperties =
            NonTechnicalSupportTicket.Properties(
                description = command.properties["description"] as String,
            )

        return NonTechnicalSupportTicket(
            contest = contest,
            member = member,
            type = command.type,
            properties = Ticket.Companion.getRawProperties(objectMapper, typedProperties),
        )
    }
}
