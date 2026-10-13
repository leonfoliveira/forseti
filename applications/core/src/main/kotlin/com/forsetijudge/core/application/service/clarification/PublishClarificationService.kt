package com.forsetijudge.core.application.service.clarification

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.clarification.ClarificationResponseDTO
import com.forsetijudge.core.port.dto.response.clarification.toResponseDTO
import com.forsetijudge.core.port.input.usecase.clarification.PublishClarificationUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service

@Service
class PublishClarificationService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val clarificationRepository: ClarificationRepository,
    private val businessEventPublisher: BusinessEventPublisher,
) : PublishClarificationUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Publishes a clarification, making it visible to everyone.
     *
     * @param command The command containing the clarification ID to be published.
     * @return A ClarificationResponseDTO representing the published clarification.
     */
    override fun execute(command: PublishClarificationUseCase.Command): ClarificationResponseDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info(
            "Publishing clarification with id: ${command.clarificationId} by member with id: $contextMemberId",
        )

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id = ${command.contestId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")
        val clarification =
            clarificationRepository.findByIdAndContestId(command.clarificationId, command.contestId)
                ?: throw NotFoundException(
                    "Could not find clarification with id = ${command.clarificationId} for contest with id = ${command.contestId}",
                )

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .throwIfErrors()

        clarification.isPublic = true
        clarificationRepository.save(clarification)
        businessEventPublisher.publish(ClarificationEvent.Published(clarification.id))

        logger.info("Clarification with id: ${clarification.id} has been published by member with id: $contextMemberId")
        return clarification.toResponseDTO()
    }
}
