package com.forsetijudge.core.application.listener.contest

import com.forsetijudge.core.application.listener.BusinessEventListener
import com.forsetijudge.core.domain.event.ContestEvent
import com.forsetijudge.core.port.driven.job.AutoFreezeJobScheduler
import org.springframework.stereotype.Component

@Component
class ContestDeletedEventListener(
    val autoFreezeJobScheduler: AutoFreezeJobScheduler,
) : BusinessEventListener<ContestEvent.Deleted> {
    override fun handle(event: ContestEvent.Deleted) {
        autoFreezeJobScheduler.cancel(event.contestId)
    }
}
