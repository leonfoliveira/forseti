package com.forsetijudge.core.application.service.contest

import com.forsetijudge.core.application.helper.AuthenticationHelper
import com.forsetijudge.core.application.helper.BusinessEventPublisher
import com.forsetijudge.core.application.helper.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.freeze
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseDTO
import com.forsetijudge.core.port.input.usecase.contest.FreezeContestUseCase
import com.forsetijudge.core.port.output.queue.AutoFreezeQueueProducer
import com.forsetijudge.core.port.output.repository.ContestRepository
import com.forsetijudge.core.port.output.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.output.repository.MemberRepository
import com.forsetijudge.core.port.output.repository.SubmissionRepository
import com.forsetijudge.core.util.SafeLogger
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime

@Service
class FreezeContestService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
    private val frozenSubmissionRepository: FrozenSubmissionRepository,
    private val autoFreezeQueueProducer: AutoFreezeQueueProducer,
    private val businessEventPublisher: BusinessEventPublisher,
) : FreezeContestUseCase {
    private val logger = SafeLogger(this::class)

    /**
     * Freezes the contest with the given ID, preventing further modifications or submissions.
     *
     * @param command The command containing the contest ID to be frozen.
     * @return A ContestWithMembersAndProblemsResponseDTO containing the updated contest information.
     */
    @Transactional
    override fun execute(command: FreezeContestUseCase.Command): ContestWithMembersAndProblemsResponseDTO {
        val contextMemberId = AuthenticationHelper.getCurrentMemberId()

        logger.info("Freezing contest with id: ${command.contestId} by member with id: $contextMemberId")

        val contest =
            contestRepository.findByIdNullable(command.contestId)
                ?: throw NotFoundException("Could not find contest with id ${command.contestId}")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, command.contestId)
                ?: throw NotFoundException("Could not find member with id $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberToBelong()
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .requireContestNotEnded()
            .throwIfErrors()

        if (contest.isFrozen()) {
            throw ForbiddenException("Contest with id ${command.contestId} is already frozen")
        }

        val frozenSubmissions =
            submissionRepository
                .findAllByContestId(contest.id)
                .map { submission -> submission.freeze() }
        frozenSubmissionRepository.saveAllAndFlush(frozenSubmissions)

        contest.autoFreezeAt = null
        contest.frozenAt = OffsetDateTime.now()
        contestRepository.saveAndFlush(contest)
        autoFreezeQueueProducer.cancel(contestId = contest.id)
        businessEventPublisher.publish(ContestEvent.Frozen(contestId = contest.id))

        logger.info("Frozen contest with id: ${command.contestId}")
        return contest.toWithMembersAndProblemsResponseDTO()
    }
}
