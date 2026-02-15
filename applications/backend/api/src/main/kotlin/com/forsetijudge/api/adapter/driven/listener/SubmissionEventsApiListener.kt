package com.forsetijudge.api.adapter.driven.listener

import com.forsetijudge.api.adapter.driven.emitter.StompLeaderboardPartialEmitter
import com.forsetijudge.api.adapter.driven.emitter.StompSubmissionEmitter
import com.forsetijudge.core.domain.entity.Submission
import com.forsetijudge.core.domain.event.SubmissionCreatedEvent
import com.forsetijudge.core.domain.event.SubmissionUpdatedEvent
import com.forsetijudge.core.port.driving.usecase.leaderboard.BuildLeaderboardUseCase
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionEventsApiListener(
    private val submissionEmitter: StompSubmissionEmitter,
    private val leaderboardPartialEmitter: StompLeaderboardPartialEmitter,
    private val buildLeaderboardUseCase: BuildLeaderboardUseCase,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Handles SubmissionCreatedEvent after the transaction is committed
     *
     * @param event the SubmissionCreatedEvent
     */
    @TransactionalEventListener(SubmissionCreatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionCreatedEvent) {
        val submission = event.submission
        logger.info("Handling submission created event: $submission")
        submissionEmitter.emit(submission)
        emmitLeaderboardPartial(submission)
    }

    /**
     * Handles SubmissionUpdatedEvent after the transaction is committed
     *
     * @param event the SubmissionUpdatedEvent
     */
    @TransactionalEventListener(SubmissionUpdatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionUpdatedEvent) {
        val submission = event.submission
        logger.info("Handling submission updated event: $submission")
        submissionEmitter.emitNonFrozen(submission)
        emmitLeaderboardPartial(submission)
    }

    private fun emmitLeaderboardPartial(submission: Submission) {
        val leaderboardPartial = buildLeaderboardUseCase.buildPartial(submission.member.id, submission.problem.id)
        leaderboardPartialEmitter.emit(submission.contest, leaderboardPartial)
    }
}
