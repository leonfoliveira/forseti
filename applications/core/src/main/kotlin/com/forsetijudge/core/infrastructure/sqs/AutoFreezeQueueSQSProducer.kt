package com.forsetijudge.core.infrastructure.sqs

import com.forsetijudge.core.infrastructure.sqs.adapter.SQSScheduler
import com.forsetijudge.core.port.output.queue.AutoFreezeQueueProducer
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.scheduler.SchedulerClient
import tools.jackson.databind.ObjectMapper

@Component
class AutoFreezeQueueSQSProducer(
    schedulerClient: SchedulerClient,
    @Value($$"${aws.sqs.auto-freeze-queue-arn}")
    private val queueArn: String,
    @Value($$"${aws.scheduler.auto-freeze-scheduler-role-arn}")
    private val roleArn: String,
    objectMapper: ObjectMapper,
) : AutoFreezeQueueProducer {
    private val sqsScheduler = SQSScheduler(schedulerClient, objectMapper, queueArn, roleArn)

    override fun produce(
        message: AutoFreezeQueueProducer.Message,
        at: OffsetDateTime,
    ) {
        sqsScheduler.schedule(message, at, "auto-freeze-${message.contestId}")
    }

    override fun cancel(contestId: UUID) {
        sqsScheduler.cancel("auto-freeze-$contestId")
    }
}
