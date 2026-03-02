package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.port.driven.job.AutoFreezeJobScheduler
import com.forsetijudge.core.port.driven.repository.ContestRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ContestCreatedEventListener(
    private val contestRepository: ContestRepository,
    private val autoFreezeJobScheduler: AutoFreezeJobScheduler,
) : BusinessEventListener<ContestEvent.Created>() {
    @TransactionalEventListener(ContestEvent.Created::class, phase = TransactionPhase.AFTER_COMMIT)
    override fun onApplicationEvent(event: ContestEvent.Created) {
        super.onApplicationEvent(event)
    }

    @Transactional(readOnly = true)
    override fun handleEvent(event: ContestEvent.Created) {
        val contest =
            contestRepository.findById(event.contestId)
                ?: throw NotFoundException("Could not find contest with id: ${event.contestId}")
        val freezeAt = contest.autoFreezeAt

        if (freezeAt != null) {
            autoFreezeJobScheduler.schedule(
                contestId = contest.id,
                freezeAt = freezeAt,
            )
        }
    }
}
