package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.scheduler.AutoFreezeJobScheduler
import com.forsetijudge.core.port.driven.scheduler.payload.AutoFreezeJobPayload
import org.slf4j.LoggerFactory
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

class ContestUpdatedEventListener(
    val autoFreezeJobScheduler: AutoFreezeJobScheduler,
) : BusinessEventListener<ContestEvent.Updated> {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(ContestEvent.Updated::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ContestEvent.Updated) {
        logger.info("Handling contest updated event with id: {}", event.contest.id)

        val contest = event.contest
        val freezeAt = contest.autoFreezeAt

        if (freezeAt != null) {
            autoFreezeJobScheduler.schedule(
                id = "freeze-contest-${contest.id}",
                payload = AutoFreezeJobPayload(contest.id),
                at = freezeAt,
            )
        } else {
            autoFreezeJobScheduler.cancel("freeze-contest-${contest.id}")
        }
    }
}
