package com.forsetijudge.core.infrastructure.sqs.adapter

import com.forsetijudge.core.port.output.queue.AutoFreezeQueueProducer
import com.forsetijudge.core.util.SafeLogger
import software.amazon.awssdk.services.scheduler.SchedulerClient
import software.amazon.awssdk.services.scheduler.model.ActionAfterCompletion
import software.amazon.awssdk.services.scheduler.model.CreateScheduleRequest
import software.amazon.awssdk.services.scheduler.model.DeleteScheduleRequest
import software.amazon.awssdk.services.scheduler.model.FlexibleTimeWindow
import software.amazon.awssdk.services.scheduler.model.FlexibleTimeWindowMode
import software.amazon.awssdk.services.scheduler.model.ResourceNotFoundException
import software.amazon.awssdk.services.scheduler.model.Target
import tools.jackson.databind.ObjectMapper
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

class SQSScheduler(
    private val schedulerClient: SchedulerClient,
    private val objectMapper: ObjectMapper,
    private val queueArn: String,
    private val roleArn: String,
) {
    val logger = SafeLogger(this::class)

    /**
     * Schedules a message to be sent to the SQS queue at a specific time.
     *
     * @param message The message to be sent to the SQS queue.
     * @param at The time at which the message should be sent.
     * @param scheduleName The name of the schedule.
     */
    fun schedule(
        message: AutoFreezeQueueProducer.Message,
        at: OffsetDateTime,
        scheduleName: String,
    ) {
        logger.info("Scheduling message to SQS queue: $queueArn, at: $at, name: $scheduleName, message: $message")

        val sqsTarget =
            Target
                .builder()
                .arn(queueArn)
                .roleArn(roleArn)
                .input(objectMapper.writeValueAsString(message))
                .build()

        val scheduleTime =
            at
                .withOffsetSameInstant(ZoneOffset.UTC)
                .toLocalDateTime()
                .truncatedTo(ChronoUnit.SECONDS)
                .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)

        val createScheduleRequest =
            CreateScheduleRequest
                .builder()
                .name(scheduleName)
                .scheduleExpression("at($scheduleTime)")
                .scheduleExpressionTimezone("UTC")
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

    /**
     * Cancels a scheduled message.
     *
     * @param scheduleName The name of the schedule to be canceled.
     */
    fun cancel(scheduleName: String) {
        logger.info("Cancelling scheduled message, name: $scheduleName")

        val deleteScheduleRequest =
            DeleteScheduleRequest
                .builder()
                .name(scheduleName)
                .build()

        try {
            schedulerClient.deleteSchedule(deleteScheduleRequest)
            logger.info("Successfully cancelled scheduled message")
        } catch (_: ResourceNotFoundException) {
            logger.info("No scheduled message found, nothing to cancel")
        } catch (e: Exception) {
            logger.error("Failed to cancel scheduled message", e)
            throw e
        }
    }
}
