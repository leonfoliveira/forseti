package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.scheduler.AutoFreezeJobScheduler
import com.forsetijudge.core.port.driven.scheduler.payload.AutoFreezeJobPayload
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ContestUpdatedEventListener(
    val autoFreezeJobScheduler: AutoFreezeJobScheduler,
) : BusinessEventListener<Contest, ContestEvent.Updated>() {
    @TransactionalEventListener(ContestEvent.Updated::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ContestEvent.Updated) {
        super.onApplicationEvent(event)
    }

    override fun handlePayload(payload: Contest) {
        val contest = payload
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
