package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.job.AutoFreezeJobScheduler
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ContestUpdatedEventListener(
    val autoFreezeJobScheduler: AutoFreezeJobScheduler,
) : BusinessEventListener<ContestEvent.Updated>() {
    @TransactionalEventListener(ContestEvent.Updated::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ContestEvent.Updated) {
        super.onApplicationEvent(event)
    }

    override fun handleEvent(event: ContestEvent.Updated) {
        val contest = event.contest
        val freezeAt = contest.autoFreezeAt

        if (freezeAt != null) {
            autoFreezeJobScheduler.schedule(
                contestId = contest.id,
                freezeAt = freezeAt,
            )
        } else {
            autoFreezeJobScheduler.cancel(contest.id)
        }
    }
}
