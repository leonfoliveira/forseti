package com.forsetijudge.core.port.driven.scheduler

import com.forsetijudge.core.domain.entity.Contest

interface AutoFreezeJobScheduler {
    fun schedule(contest: Contest)

    fun cancel(contest: Contest)
}
