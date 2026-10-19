package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseDTO
import com.forsetijudge.core.port.input.usecase.contest.UnfreezeContestUseCase
import com.forsetijudge.core.port.output.queue.FreezeQueueProducer
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UnfreezeContestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val freezeQueueProducer: FreezeQueueProducer,
    private val businessEventPublisher: BusinessEventPublisher,
) : UnfreezeContestUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Unfreezes the contest with the given ID, allowing modifications and submissions to resume.
     *
     * @param command The command containing the contest ID to be unfrozen.
     * @return A ContestWithMembersAndProblemsResponseDTO containing the updated contest information.
     */
    @Transactional
    override fun execute(command: UnfreezeContestUseCase.Command): ContestWithMembersAndProblemsResponseDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Unfreezing contest with id: ${command.contestId} by member with id: $contextMemberId")

        val contest =
            contestRepository.findById(command.contestId)
                ?: throw NotFoundException("Could not find contest with id ${command.contestId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .throwIfErrors()

        if (!contest.isFrozen()) {
            throw ForbiddenException("Contest with id ${command.contestId} is not frozen")
        }

        val freezeAt = contest.freezeAt!!
        contest.freezeAt = null
        contestRepository.save(contest)
        freezeQueueProducer.cancel(contestId = contest.id)
        businessEventPublisher.publish(ContestEvent.Unfrozen(contestId = contest.id, freezeAt = freezeAt))

        logger.info("Unfrozen contest with id: ${command.contestId} created")
        return contest.toWithMembersAndProblemsResponseDTO()
    }
}
