package com.forsetijudge.core.port.driven.job

import java.time.OffsetDateTime
import java.util.UUID

interface AutoFreezeJobScheduler {
    fun schedule(
        contestId: UUID,
        freezeAt: OffsetDateTime,
    )

    fun cancel(contestId: UUID)
}
