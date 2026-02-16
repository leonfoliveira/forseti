package com.forsetijudge.core.application.service.leaderboard

import com.forsetijudge.core.application.util.ContestAuthorizer
import com.forsetijudge.core.domain.entity.Member
import com.forsetijudge.core.domain.event.LeaderboardFreezeEvent
import com.forsetijudge.core.domain.event.LeaderboardUnfreezeEvent
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.repository.ContestRepository
import com.forsetijudge.core.port.driven.repository.MemberRepository
import com.forsetijudge.core.port.driving.usecase.leaderboard.FreezeLeaderboardUseCase
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.util.UUID

@Service
class FreezeLeaderboardService(
    private val contestRepository: ContestRepository,
    private val memberRepository: MemberRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) : FreezeLeaderboardUseCase {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Freezes the leaderboard for a specific contest.
     *
     * @param contestId The ID of the contest for which the leaderboard should be frozen.
     * @param memberId The ID of the member who is performing the freeze action.
     */
    @Transactional
    override fun freeze(
        contestId: UUID,
        memberId: UUID,
    ) {
        logger.info("Freezing leaderboard for contest with id $contestId")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id $contestId")
        val member =
            memberRepository.findEntityById(memberId)
                ?: throw NotFoundException("Could not find member with id $memberId")

        ContestAuthorizer(contest, member)
            .checkMemberType(Member.Type.API, Member.Type.ROOT, Member.Type.ADMIN)

        if (contest.isFrozen) {
            throw ForbiddenException("The leaderboard for this contest is already frozen")
        }

        contest.frozenAt = OffsetDateTime.now()

        contestRepository.save(contest)
        applicationEventPublisher.publishEvent(LeaderboardFreezeEvent(this, contest))
        logger.info("Leaderboard for contest with id $contestId frozen successfully")
    }

    /**
     * Freezes the leaderboard for a specific contest.
     *
     * @param contestId The ID of the contest for which the leaderboard should be frozen.
     * @param memberId The ID of the member who is performing the freeze action.
     */
    @Transactional
    override fun unfreeze(
        contestId: UUID,
        memberId: UUID,
    ) {
        logger.info("Unfreezing leaderboard for contest with id $contestId")

        val contest =
            contestRepository.findEntityById(contestId)
                ?: throw NotFoundException("Could not find contest with id $contestId")
        val member =
            memberRepository.findEntityById(memberId)
                ?: throw NotFoundException("Could not find member with id $memberId")

        ContestAuthorizer(contest, member)
            .checkMemberType(Member.Type.API, Member.Type.ROOT, Member.Type.ADMIN)

        if (!contest.isFrozen) {
            throw ForbiddenException("The leaderboard for this contest is not frozen")
        }

        contest.frozenAt = null

        contestRepository.save(contest)
        applicationEventPublisher.publishEvent(LeaderboardUnfreezeEvent(this, contest))
        logger.info("Leaderboard for contest with id $contestId unfrozen successfully")
    }
}
