package com.forsetijudge.infrastructure.adapter.driven.scheduler

import com.forsetijudge.core.domain.entity.Contest
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.core.port.driven.scheduler.AutoFreezeJobScheduler
import com.forsetijudge.infrastructure.adapter.driving.job.AutoFreezeQuartzJob
import com.forsetijudge.infrastructure.adapter.driving.job.QuartzJob
import com.forsetijudge.infrastructure.adapter.dto.job.QuartzMessage
import com.forsetijudge.infrastructure.adapter.dto.job.payload.AutoFreezeJobPayload
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.time.OffsetDateTime

@Component
class AutoFreezeQuartzJobScheduler(
    private val quartzJobScheduler: QuartzJobScheduler,
) : AutoFreezeJobScheduler {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun schedule(contest: Contest) {
        logger.info("Scheduling auto-freeze job for contest ${contest.id} at ${contest.autoFreezeAt}")

        if (contest.autoFreezeAt == null) {
            throw BusinessException("Cannot schedule auto-freeze job because autoFreezeAt is null")
        }

        if (!contest.autoFreezeAt!!.isAfter(OffsetDateTime.now())) {
            throw BusinessException("Cannot schedule auto-freeze job because autoFreezeAt is in the past")
        }

        val message =
            QuartzMessage(
                id = contest.id.toString(),
                payload = AutoFreezeJobPayload(contestId = contest.id),
            )

        @Suppress("UNCHECKED_CAST")
        quartzJobScheduler.schedule(
            message,
            AutoFreezeQuartzJob::class.java as Class<QuartzJob<AutoFreezeJobPayload>>,
            contest.autoFreezeAt!!,
        )

        logger.info("Auto-freeze job scheduled successfully")
    }

    override fun cancel(contest: Contest) {
        logger.info("Cancelling auto-freeze job for contest ${contest.id}")

        quartzJobScheduler.cancel(contest.id.toString())

        logger.info("Auto-freeze job cancelled successfully")
    }
}
