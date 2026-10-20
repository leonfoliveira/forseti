package com.forsetijudge.core.infrastructure.sqs

import com.forsetijudge.core.port.output.queue.AutoFreezeQueueProducer
import com.forsetijudge.core.util.SafeLogger
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import software.amazon.awssdk.services.scheduler.SchedulerClient
import software.amazon.awssdk.services.scheduler.model.ActionAfterCompletion
import software.amazon.awssdk.services.scheduler.model.CreateScheduleRequest
import software.amazon.awssdk.services.scheduler.model.DeleteScheduleRequest
import software.amazon.awssdk.services.scheduler.model.FlexibleTimeWindow
import software.amazon.awssdk.services.scheduler.model.FlexibleTimeWindowMode
import software.amazon.awssdk.services.scheduler.model.ResourceNotFoundException
import software.amazon.awssdk.services.scheduler.model.Target
import tools.jackson.databind.ObjectMapper

@Component
class AutoFreezeQueueSQSProducer(
    private val schedulerClient: SchedulerClient,
    @Value($$"${spring.cloud.aws.sqs.auto-freeze-queue-arn}")
    private val queueArn: String,
    private val objectMapper: ObjectMapper,
) : AutoFreezeQueueProducer {
    private val logger = SafeLogger(this::class)

    override fun produce(
        message: AutoFreezeQueueProducer.Message,
        at: OffsetDateTime,
    ) {
        logger.info("Producing message to SQS queue: $queueArn, at: $at, message: $message")

        val scheduleName = "auto-freeze-${message.contestId}"

        val sqsTarget =
            Target
                .builder()
                .arn(queueArn)
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

    override fun cancel(contestId: UUID) {
        logger.info("Cancelling scheduled freeze event for contest: $contestId")

        val scheduleName = "auto-freeze-$contestId"

        val deleteScheduleRequest =
            DeleteScheduleRequest
                .builder()
                .name(scheduleName)
                .build()

        try {
            schedulerClient.deleteSchedule(deleteScheduleRequest)
            logger.info("Successfully cancelled scheduled auto freeze event for contest: $contestId")
        } catch (_: ResourceNotFoundException) {
            logger.info("No scheduled auto freeze event found for contest: $contestId, nothing to cancel")
        } catch (e: Exception) {
            logger.error("Failed to cancel scheduled auto freeze event for contest: $contestId", e)
            throw e
        }
    }
}
