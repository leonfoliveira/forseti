package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.scheduler.AutoFreezeJobScheduler
import org.slf4j.LoggerFactory
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

class ContestDeletedEventListener(
    val autoFreezeJobScheduler: AutoFreezeJobScheduler,
) : BusinessEventListener<ContestEvent.Deleted> {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @TransactionalEventListener(ContestEvent.Deleted::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ContestEvent.Deleted) {
        logger.info("Handling contest deleted event with id: {}", event.contest.id)

        val contest = event.contest

        autoFreezeJobScheduler.cancel("freeze-contest-${contest.id}")
    }
}
