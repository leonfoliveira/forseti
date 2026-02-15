package com.forsetijudge.api.adapter.driving.listener

import com.forsetijudge.core.domain.event.ContestCreatedEvent
import com.forsetijudge.core.domain.event.ContestDeletedEvent
import com.forsetijudge.core.domain.event.ContestUpdatedEvent
import com.forsetijudge.core.port.driven.scheduler.AutoFreezeJobScheduler
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ContestEventsApiListener(
    val autoFreezeJobScheduler: AutoFreezeJobScheduler,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(ContestCreatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: ContestCreatedEvent) {
        val contest = event.contest
        logger.info("Handling contest created event for contest: ${contest.id}")

        if (contest.autoFreezeAt != null) {
            autoFreezeJobScheduler.schedule(contest)
        }
    }

    @TransactionalEventListener(ContestUpdatedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: ContestUpdatedEvent) {
        val contest = event.contest
        logger.info("Handling contest updated event for contest: ${contest.id}")

        autoFreezeJobScheduler.cancel(contest)
        if (contest.autoFreezeAt != null) {
            autoFreezeJobScheduler.schedule(contest)
        }
    }

    @TransactionalEventListener(ContestDeletedEvent::class, phase = TransactionPhase.AFTER_COMMIT)
    fun onApplicationEvent(event: ContestDeletedEvent) {
        val contest = event.contest
        logger.info("Handling contest deleted event for contest: ${contest.id}")

        autoFreezeJobScheduler.cancel(contest)
    }
}
