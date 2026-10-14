package com.forsetijudge.core.application.service.clarification

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Clarification
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ClarificationEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.clarification.ClarificationResponseDTO
import com.forsetijudge.core.port.dto.response.clarification.toResponseDTO
import com.forsetijudge.core.port.input.usecase.clarification.CreateClarificationUseCase
import com.forsetijudge.core.port.output.repository.ClarificationRepository
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.ProblemRepository
import com.forsetijudge.core.util.SafeLogger
import jakarta.transaction.Transactional
import jakarta.validation.Valid
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated

@Service
@Validated
class CreateClarificationService(
    private val contestRepository: ContestRepository,
    private val problemRepository: ProblemRepository,
    private val memberRepository: MemberRepository,
    private val clarificationRepository: ClarificationRepository,
    private val businessEventPublisher: BusinessEventPublisher,
) : CreateClarificationUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Creates a clarification for a given contest and problem.
     *
     * @param command The command containing the contest ID, optional problem ID, and clarification text.
     * @return A ClarificationResponseDTO representing the created clarification.
     */
    @Transactional
    override fun execute(
        @Valid command: CreateClarificationUseCase.Command,
    ): ClarificationResponseDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info(
            "Creating clarification for contest with id: ${command.contestId} by member with id: $contextMemberId",
        )

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id = ${command.contestId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id = $contextMemberId in this contest")
        val problem =
            command.problemId?.let {
                problemRepository.findByIdAndContestId(it, command.contestId)
                    ?: throw NotFoundException("Could not find problem with id = $it in this contest")
            }

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.CONTESTANT)
            .requireContestActive()
            .throwIfErrors()

        val clarification =
            Clarification(
                contest = contest,
                problem = problem,
                member = member,
                text = command.text,
            )
        clarificationRepository.save(clarification)
        businessEventPublisher.publish(ClarificationEvent.Created(clarification.id))

        logger.info("Created clarification with id: ${clarification.id}")
        return clarification.toResponseDTO()
    }
}
