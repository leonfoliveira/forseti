package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.job.AutoFreezeJobScheduler
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ContestDeletedEventListener(
    val autoFreezeJobScheduler: AutoFreezeJobScheduler,
) : BusinessEventListener<ContestEvent.Deleted>() {
    @TransactionalEventListener(ContestEvent.Deleted::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ContestEvent.Deleted) {
        super.onApplicationEvent(event)
    }

    @Transactional(readOnly = true)
    override fun handleEvent(event: ContestEvent.Deleted) {
        autoFreezeJobScheduler.cancel(event.contestId)
    }
}
