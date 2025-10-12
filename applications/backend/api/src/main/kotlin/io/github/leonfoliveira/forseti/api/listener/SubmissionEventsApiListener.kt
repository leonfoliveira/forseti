package io.github.leonfoliveira.forseti.api.listener

import io.github.leonfoliveira.forseti.api.emitter.StompLeaderboardEmitter
import io.github.leonfoliveira.forseti.api.emitter.StompSubmissionEmitter
import io.github.leonfoliveira.forseti.common.domain.entity.Submission
import io.github.leonfoliveira.forseti.common.event.SubmissionCreatedEvent
import io.github.leonfoliveira.forseti.common.event.SubmissionUpdatedEvent
import io.github.leonfoliveira.forseti.common.service.leaderboard.FindLeaderboardService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionEventsApiListener(
    private val stompSubmissionEmitter: StompSubmissionEmitter,
    private val stompLeaderboardEmitter: StompLeaderboardEmitter,
    private val leaderboardService: FindLeaderboardService,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(SubmissionCreatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionCreatedEvent) {
        logger.info("Handling submission created event: ${event.submission}")
        emmitSubmissionAndLeaderboard(event.submission)
    }

    @TransactionalEventListener(SubmissionUpdatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionUpdatedEvent) {
        logger.info("Handling submission updated event: ${event.submission}")
        emmitSubmissionAndLeaderboard(event.submission)
    }

    private fun emmitSubmissionAndLeaderboard(submission: Submission) {
        stompSubmissionEmitter.emit(submission)
        val leaderboard = leaderboardService.findByContestId(submission.contest.id)
        stompLeaderboardEmitter.emit(leaderboard)
    }
}
