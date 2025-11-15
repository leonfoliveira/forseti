package io.github.leonfoliveira.forseti.api.application.listener

import io.github.leonfoliveira.forseti.api.application.port.driven.LeaderboardEmitter
import io.github.leonfoliveira.forseti.api.application.port.driven.SubmissionEmitter
import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.application.domain.event.SubmissionCreatedEvent
import io.github.leonfoliveira.forseti.common.application.domain.event.SubmissionUpdatedEvent
import io.github.leonfoliveira.forseti.common.application.service.leaderboard.FindLeaderboardService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionEventsApiListener(
    private val submissionEmitter: SubmissionEmitter,
    private val leaderboardEmitter: LeaderboardEmitter,
    private val leaderboardService: FindLeaderboardService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Handles SubmissionCreatedEvent after the transaction is committed
     *
     * @param event the SubmissionCreatedEvent
     */
    @TransactionalEventListener(SubmissionCreatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionCreatedEvent) {
        logger.info("Handling submission created event: ${event.submission}")
        emmitSubmissionAndLeaderboard(event.submission)
    }

    /**
     * Handles SubmissionUpdatedEvent after the transaction is committed
     *
     * @param event the SubmissionUpdatedEvent
     */
    @TransactionalEventListener(SubmissionUpdatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionUpdatedEvent) {
        logger.info("Handling submission updated event: ${event.submission}")
        emmitSubmissionAndLeaderboard(event.submission)
    }

    private fun emmitSubmissionAndLeaderboard(submission: Submission) {
        submissionEmitter.emit(submission)
        val leaderboard = leaderboardService.findByContestId(submission.contest.id)
        leaderboardEmitter.emit(leaderboard)
    }
}
