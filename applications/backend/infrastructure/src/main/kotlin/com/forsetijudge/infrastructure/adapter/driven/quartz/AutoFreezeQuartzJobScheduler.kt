package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.forsetijudge.core.port.driven.job.AutoFreezeJobScheduler
import com.forsetijudge.infrastructure.adapter.driving.job.AutoFreezeQuartzJob
import com.forsetijudge.infrastructure.adapter.dto.quartz.QuartzMessage
import com.forsetijudge.infrastructure.adapter.dto.quartz.payload.AutoFreezeJobPayload
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import java.util.UUID

@Component
class AutoFreezeQuartzJobScheduler(
    private val quartzJobScheduler: QuartzJobScheduler,
) : AutoFreezeJobScheduler {
    companion object {
        const val JOB_ID_PREFIX = "contest-auto-freeze"
    }

    override fun schedule(
        contestId: UUID,
        freezeAt: OffsetDateTime,
    ) {
        val id = "$JOB_ID_PREFIX:$contestId"
        val message =
            QuartzMessage(
                id = id,
                payload = AutoFreezeJobPayload(contestId = contestId),
            )

        quartzJobScheduler.schedule(
            jobClass = AutoFreezeQuartzJob::class,
            message = message,
            at = freezeAt,
        )
    }

    override fun cancel(contestId: UUID) {
        val id = "$JOB_ID_PREFIX:$contestId"
        quartzJobScheduler.cancel(id)
    }
}
