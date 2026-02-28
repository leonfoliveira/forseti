package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.forsetijudge.core.port.driven.job.AttachmentBucketCleanerJobScheduler
import com.forsetijudge.infrastructure.adapter.driving.job.AttachmentBucketCleanerQuartzJob
import com.forsetijudge.infrastructure.adapter.dto.quartz.QuartzMessage
import com.forsetijudge.infrastructure.adapter.dto.quartz.payload.AttachmentBucketCleanerJobPayload
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import kotlin.time.Duration
import kotlin.time.toJavaDuration

@Component
class AttachmentBucketCleanerQuartzJobScheduler(
    private val quartzJobScheduler: QuartzJobScheduler,
) : AttachmentBucketCleanerJobScheduler {
    companion object {
        const val ID = "attachment-bucket-cleaner"
    }

    override fun schedule(interval: Duration) {
        val message = QuartzMessage(id = ID, payload = AttachmentBucketCleanerJobPayload())
        quartzJobScheduler.schedule(
            jobClass = AttachmentBucketCleanerQuartzJob::class,
            message = message,
            startAt = OffsetDateTime.now().plus(interval.toJavaDuration()),
            interval = interval.toJavaDuration(),
        )
    }
}
