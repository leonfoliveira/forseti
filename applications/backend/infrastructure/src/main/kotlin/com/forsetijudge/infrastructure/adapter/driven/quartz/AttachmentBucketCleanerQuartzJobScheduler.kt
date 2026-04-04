package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.forsetijudge.core.port.driven.job.AttachmentBucketCleanerJobScheduler
import com.forsetijudge.infrastructure.adapter.driving.job.QueueableQuartzJob
import com.forsetijudge.infrastructure.adapter.dto.quartz.QuartzMessage
import com.forsetijudge.infrastructure.adapter.dto.quartz.body.QueueableJobMessageBody
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.AttachmentBucketCleanerQueueMessageBody
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import kotlin.time.Duration
import kotlin.time.toJavaDuration

@Component
class AttachmentBucketCleanerQuartzJobScheduler(
    private val quartzJobScheduler: QuartzJobScheduler,
    @Value("\${spring.rabbitmq.exchange.direct}")
    private val exchange: String,
    @Value("\${spring.rabbitmq.routing-key.attachment-bucket-cleaner-routing-key}")
    private val routingKey: String,
) : AttachmentBucketCleanerJobScheduler {
    companion object {
        const val ID = "attachment-bucket-cleaner"
    }

    override fun schedule(interval: Duration) {
        val message =
            QuartzMessage(
                id = ID,
                body =
                    QueueableJobMessageBody(
                        exchange = exchange,
                        routingKey = routingKey,
                        body = AttachmentBucketCleanerQueueMessageBody(),
                    ),
            )
        quartzJobScheduler.schedule(
            jobClass = QueueableQuartzJob::class,
            message = message,
            startAt = OffsetDateTime.now().plus(interval.toJavaDuration()),
            interval = interval.toJavaDuration(),
        )
    }
}
