package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.forsetijudge.core.port.driven.job.AutoFreezeJobScheduler
import com.forsetijudge.infrastructure.adapter.driving.job.QueueableQuartzJob
import com.forsetijudge.infrastructure.adapter.dto.quartz.QuartzMessage
import com.forsetijudge.infrastructure.adapter.dto.quartz.body.QueueableJobMessageBody
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body.AutoFreezeQueueMessageBody
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import java.util.UUID

@Component
class AutoFreezeQuartzJobScheduler(
    private val quartzJobScheduler: QuartzJobScheduler,
    @Value("\${spring.rabbitmq.exchange.direct}")
    private val exchange: String,
    @Value("\${spring.rabbitmq.routing-key.auto-freeze}")
    private val routingKey: String,
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
                body =
                    QueueableJobMessageBody(
                        exchange = exchange,
                        routingKey = routingKey,
                        body = AutoFreezeQueueMessageBody(contestId = contestId),
                    ),
            )

        quartzJobScheduler.schedule(
            jobClass = QueueableQuartzJob::class,
            message = message,
            at = freezeAt,
        )
    }

    override fun cancel(contestId: UUID) {
        val id = "$JOB_ID_PREFIX:$contestId"
        quartzJobScheduler.cancel(id)
    }
}
