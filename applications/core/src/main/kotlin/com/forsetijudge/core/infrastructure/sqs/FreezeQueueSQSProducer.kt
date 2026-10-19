package com.forsetijudge.core.infrastructure.sqs

import com.forsetijudge.core.port.output.queue.FreezeQueueProducer
import com.forsetijudge.core.util.SafeLogger
import java.time.OffsetDateTime
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.scheduler.SchedulerClient
import software.amazon.awssdk.services.scheduler.model.ActionAfterCompletion
import software.amazon.awssdk.services.scheduler.model.CreateScheduleRequest
import software.amazon.awssdk.services.scheduler.model.DeleteScheduleRequest
import software.amazon.awssdk.services.scheduler.model.FlexibleTimeWindow
import software.amazon.awssdk.services.scheduler.model.FlexibleTimeWindowMode
import software.amazon.awssdk.services.scheduler.model.Target
import tools.jackson.databind.ObjectMapper

@Component
class FreezeQueueSQSProducer(
    private val schedulerClient: SchedulerClient,
    @Value($$"${spring.cloud.aws.sqs.freeze-queue}")
    private val queueName: String,
    private val objectMapper: ObjectMapper,
) : FreezeQueueProducer {
    private val logger = SafeLogger(this::class)

    override fun produce(
        message: FreezeQueueProducer.Message,
        at: OffsetDateTime,
    ) {
        logger.info("Producing message to SQS queue: $queueName, at: $at, message: $message")

        val scheduleName = "freeze-${message.contestId}"

        val sqsTarget =
            Target
                .builder()
                .arn(queueName)
                .input(objectMapper.writeValueAsString(message))
                .build()

        val createScheduleRequest =
            CreateScheduleRequest
                .builder()
                .name(scheduleName)
                .scheduleExpression("at($at)")
                .flexibleTimeWindow(
                    FlexibleTimeWindow
                        .builder()
                        .mode(FlexibleTimeWindowMode.OFF)
                        .build(),
                ).target(sqsTarget)
                .actionAfterCompletion(ActionAfterCompletion.DELETE)
                .build()

        schedulerClient.createSchedule(createScheduleRequest)
    }

    override fun cancel(contestId: String) {
        logger.info("Cancelling scheduled freeze event for contest: $contestId")

        val scheduleName = "freeze-$contestId"

        val deleteScheduleRequest =
            DeleteScheduleRequest
                .builder()
                .name(scheduleName)
                .build()

        try {
            schedulerClient.deleteSchedule(deleteScheduleRequest)
            logger.info("Successfully cancelled scheduled freeze event for contest: $contestId")
        } catch (e: Exception) {
            logger.error("Failed to cancel scheduled freeze event for contest: $contestId", e)
        }
    }
}
