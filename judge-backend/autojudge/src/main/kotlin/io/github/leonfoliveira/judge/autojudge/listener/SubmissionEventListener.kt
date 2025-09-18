package io.github.leonfoliveira.judge.autojudge.listener

import io.github.leonfoliveira.judge.autojudge.event.SubmissionJudgedEvent
import io.github.leonfoliveira.judge.autojudge.feign.ApiClient
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class SubmissionEventListener(
    private val apiClient: ApiClient,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(SubmissionJudgedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: SubmissionJudgedEvent) {
        logger.info("Handling submission judged event: ${event.submission}")
        apiClient.updateSubmissionAnswer(event.submission.contest.id, event.submission.id, event.answer)
    }
}
