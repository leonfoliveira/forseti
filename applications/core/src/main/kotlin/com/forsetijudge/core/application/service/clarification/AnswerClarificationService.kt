package com.forsetijudge.core.application.service.clarification

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.clarification.ClarificationResponseDTO
import com.forsetijudge.core.port.dto.response.clarification.toResponseDTO
import com.forsetijudge.core.port.input.usecase.clarification.AnswerClarificationUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.SafeLogger
import jakarta.transaction.Transactional
import jakarta.validation.Valid
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated

@Service
@Validated
class AnswerClarificationService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val clarificationRepository: ClarificationRepository,
    private val businessEventPublisher: BusinessEventPublisher,
) : AnswerClarificationUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Answers a clarification with the provided answer text.
     *
     * @param command The command containing the clarification ID and the answer text.
     * @return A ClarificationResponseDTO representing the answered clarification.
     */
    @Transactional
    override fun execute(
        @Valid command: AnswerClarificationUseCase.Command,
    ): ClarificationResponseDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info(
            "Answering clarification with id: ${command.clarificationId} for contest with id: ${command.contestId} by member with id: $contextMemberId",
        )

        val contest =
            contestRepository.findByIdNullable(command.contestId)
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
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN, Member.Type.JUDGE)
            .throwIfErrors()

        if (clarification.answer != null) {
            throw ForbiddenException("Clarification with id = ${command.clarificationId} has already been answered")
        }

        clarification.answer =
            Clarification.Answer(
                member = member,
                text = command.text,
            )
        clarificationRepository.saveAndFlush(clarification)
        businessEventPublisher.publish(ClarificationEvent.Answered(clarification.id))

        logger.info("Answered clarification with id: ${command.clarificationId}")
        return clarification.toResponseDTO()
    }
}
