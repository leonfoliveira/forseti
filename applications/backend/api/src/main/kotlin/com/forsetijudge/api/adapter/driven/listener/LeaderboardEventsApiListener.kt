package com.forsetijudge.api.adapter.driven.listener

import com.forsetijudge.api.adapter.driven.emitter.StompLeaderboardEmitter
import com.forsetijudge.core.domain.event.LeaderboardFreezeEvent
import com.forsetijudge.core.domain.event.LeaderboardUnfreezeEvent
import com.forsetijudge.core.port.driving.usecase.leaderboard.BuildLeaderboardUseCase
import com.forsetijudge.core.port.driving.usecase.submission.FindSubmissionUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class LeaderboardEventsApiListener(
    private val leaderboardEmitter: StompLeaderboardEmitter,
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
    private val findSubmissionUseCase: FindSubmissionUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(LeaderboardFreezeEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: LeaderboardFreezeEvent) {
        logger.info("Handling leaderboard freeze event for contest: ${event.contest.id}")
        leaderboardEmitter.emitFreeze(event.contest)
    }

    @TransactionalEventListener(LeaderboardUnfreezeEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: LeaderboardUnfreezeEvent) {
        logger.info("Handling leaderboard unfreeze event for contest: ${event.contest.id}")
        val leaderboard = buildLeaderboardUseCase.build(event.contest.id, null)
        val submissions = findSubmissionUseCase.findAllByContestSinceLastFreeze(event.contest.id)
        leaderboardEmitter.emitUnfreeze(leaderboard, submissions)
    }
}
