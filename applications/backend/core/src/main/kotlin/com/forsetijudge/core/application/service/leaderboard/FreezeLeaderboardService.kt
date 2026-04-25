package com.forsetijudge.core.application.service.leaderboard

import com.forsetijudge.core.application.helper.outbox.OutboxEventPublisher
import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.entity.freeze
import com.forsetijudge.core.domain.event.LeaderboardEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.FrozenSubmissionRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driven.repository.SubmissionRepository
import com.forsetijudge.core.port.driving.usecase.external.leaderboard.FreezeLeaderboardUseCase
import com.forsetijudge.core.port.dto.response.contest.ContestWithMembersAndProblemsResponseBodyDTO
import com.forsetijudge.core.port.dto.response.contest.toWithMembersAndProblemsResponseBodyDTO
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FreezeLeaderboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val submissionRepository: SubmissionRepository,
    private val frozenSubmissionRepository: FrozenSubmissionRepository,
    private val outboxEventPublisher: OutboxEventPublisher,
) : FreezeLeaderboardUseCase {
    private val logger = SafeLogger(this::class)

    @Transactional
    override fun execute(): ContestWithMembersAndProblemsResponseBodyDTO {
        val contextContestId = ExecutionContext.getContestId()
        val contextMemberId = ExecutionContext.getMemberId()

        logger.info("Freezing leaderboard for contest with id $contextContestId")

        val contest =
            contestRepository.findById(contextContestId)
                ?: throw NotFoundException("Could not find contest with id $contextContestId")
        val member =
            memberRepository.findByIdAndContestIdOrContestIsNull(contextMemberId, contextContestId)
                ?: throw NotFoundException("Could not find member with id $contextMemberId in this contest")

        ContestAuthorizer(contest, member)
            .requireMemberType(Member.Type.ROOT, Member.Type.ADMIN)
            .throwIfErrors()

        if (contest.isFrozen) {
            throw ForbiddenException("The leaderboard for this contest is already frozen")
        }

        contest.frozenAt = ExecutionContext.get().startedAt

        freezeSubmissions(contest)
        contestRepository.save(contest)
        outboxEventPublisher.publish(LeaderboardEvent.Frozen(contest.id))

        logger.info("Leaderboard frozen successfully")
        return contest.toWithMembersAndProblemsResponseBodyDTO()
    }

    /**
     * Freezes all submissions of the contest by creating corresponding FrozenSubmission entities
     *
     * @param contest the contest for which to freeze the submissions
     */
    private fun freezeSubmissions(contest: Contest) {
        val submissions = submissionRepository.findAllByContestId(contest.id)
        val frozenSubmissions = submissions.map { it.freeze() }
        frozenSubmissionRepository.saveAll(frozenSubmissions)
    }
}
