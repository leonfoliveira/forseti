package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.scheduler.AutoFreezeJobScheduler
import com.forsetijudge.core.port.driven.scheduler.payload.AutoFreezeJobPayload
import org.slf4j.LoggerFactory
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

class ContestCreatedEventListener(
    val autoFreezeJobScheduler: AutoFreezeJobScheduler,
) : BusinessEventListener<ContestEvent.Created> {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(ContestEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ContestEvent.Created) {
        logger.info("Handling contest created event with id: {}", event.contest.id)

        val contest = event.contest
        val freezeAt = contest.autoFreezeAt

        if (freezeAt != null) {
            autoFreezeJobScheduler.schedule(
                id = "freeze-contest-${contest.id}",
                payload = AutoFreezeJobPayload(contest.id),
                at = freezeAt,
            )
        }
    }
}
