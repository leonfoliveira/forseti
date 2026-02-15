package com.forsetijudge.infrastructure.adapter.driven.scheduler

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.domain.exception.BusinessException
import com.forsetijudge.infrastructure.adapter.driving.job.QuartzJob
import com.forsetijudge.infrastructure.adapter.dto.job.QuartzMessage
import org.quartz.JobBuilder
import org.quartz.JobKey
import org.quartz.Scheduler
import org.quartz.SimpleScheduleBuilder
import org.quartz.TriggerBuilder
import org.springframework.stereotype.Component
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.Date

@Component
class QuartzJobScheduler(
    private val scheduler: Scheduler,
    private val objectMapper: ObjectMapper,
) {
    private val logger = org.slf4j.LoggerFactory.getLogger(this::class.java)

    /**
     * Schedules a Quartz job to be executed at a specific time in the future.
     *
     * @param message The QuartzMessage containing the payload and metadata for the job to be scheduled.
     * @param jobClass The class of the QuartzJob to be executed.
     * @param at The OffsetDateTime at which the job should be executed.
     */
    fun <TPayload : Serializable> schedule(
        message: QuartzMessage<TPayload>,
        jobClass: Class<QuartzJob<TPayload>>,
        at: OffsetDateTime,
    ) {
        logger.info("Scheduling a ${jobClass.simpleName} job with id ${message.id} to run at $at")

        if (!at.isAfter(OffsetDateTime.now())) {
            throw BusinessException("Cannot schedule a job in the past")
        }

        val jobDetail =
            JobBuilder
                .newJob(jobClass)
                .withIdentity(message.id)
                .usingJobData("id", message.id)
                .usingJobData("traceId", message.traceId)
                .usingJobData("payload", objectMapper.writeValueAsString(message.payload))
                .usingJobData("retries", message.retries)
                .storeDurably()
                .build()

        val trigger =
            TriggerBuilder
                .newTrigger()
                .forJob(jobDetail)
                .withIdentity(message.id)
                .startAt(Date.from(at.toInstant()))
                .withSchedule(
                    SimpleScheduleBuilder
                        .simpleSchedule()
                        .withMisfireHandlingInstructionFireNow(),
                ).build()

        scheduler.scheduleJob(jobDetail, trigger)

        logger.info("Job scheduled successfully")
    }

    /**
     * Cancels a scheduled Quartz job with the given messageId if it exists.
     *
     * @param jobId The ID of the job to be cancelled.
     */
    fun cancel(jobId: String) {
        logger.info("Attempting to cancel job with id $jobId")

        if (scheduler.checkExists(JobKey.jobKey(jobId))) {
            scheduler.deleteJob(JobKey.jobKey(jobId))
            logger.info("Job cancelled successfully")
        } else {
            logger.warn("Job does not exist")
        }
    }
}
