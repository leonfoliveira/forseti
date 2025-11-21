package io.github.leonfoliveira.forseti.api.adapter.driven.listener

import io.github.leonfoliveira.forseti.api.adapter.driven.emitter.StompLeaderboardEmitter
import io.github.leonfoliveira.forseti.api.adapter.driven.emitter.StompSubmissionEmitter
import live.forseti.core.application.service.leaderboard.BuildLeaderboardService
import live.forseti.core.domain.entity.Submission
import live.forseti.core.domain.event.SubmissionCreatedEvent
import live.forseti.core.domain.event.SubmissionUpdatedEvent
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionEventsApiListener(
    private val submissionEmitter: StompSubmissionEmitter,
    private val leaderboardEmitter: StompLeaderboardEmitter,
    private val buildLeaderboardService: BuildLeaderboardService,
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
        val leaderboard = buildLeaderboardService.build(submission.contest.id)
        leaderboardEmitter.emit(leaderboard)
    }
}
