package com.forsetijudge.api.adapter.driven.listener

import com.forsetijudge.api.adapter.driven.emitter.StompLeaderboardEmitter
import com.forsetijudge.api.adapter.driven.emitter.StompSubmissionEmitter
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
    private val submissionEmitter: StompSubmissionEmitter,
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
    private val findSubmissionUseCase: FindSubmissionUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(LeaderboardUnfreezeEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: LeaderboardUnfreezeEvent) {
        logger.info("Handling leaderboard unfreeze event for contest: ${event.contest.id}")
        val leaderboard = buildLeaderboardUseCase.build(event.contest.id, null)
        leaderboardEmitter.emit(leaderboard)
        val submissions = findSubmissionUseCase.findAllByContestSinceLastFreeze(event.contest.id)
        submissionEmitter.emitBatch(submissions)
    }
}
