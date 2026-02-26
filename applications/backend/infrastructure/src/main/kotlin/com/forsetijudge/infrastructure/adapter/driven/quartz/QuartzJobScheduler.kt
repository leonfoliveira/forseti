package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driven.job.JobScheduler
import com.forsetijudge.infrastructure.adapter.dto.job.QuartzMessage
import org.quartz.Job
import org.quartz.JobBuilder
import org.quartz.JobKey
import org.quartz.Scheduler
import org.quartz.SimpleScheduleBuilder
import org.quartz.TriggerBuilder
import org.springframework.beans.factory.annotation.Autowired
import java.io.Serializable
import java.time.OffsetDateTime
import java.util.Date

abstract class QuartzJobScheduler<TPayload : Serializable>(
    private val jobClass: Class<out Job>,
) : JobScheduler<TPayload> {
    private val logger = SafeLogger(this::class)

    @Autowired
    private lateinit var scheduler: Scheduler

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    /**
     * Schedules a Quartz job to be executed at a specific time in the future.
     *
     * @param payload The payload to be passed to the QuartzJob when it is executed. It must be serializable.
     * @param at The OffsetDateTime at which the job should be executed.
     */
    override fun schedule(
        id: String,
        payload: TPayload,
        at: OffsetDateTime,
    ) {
        logger.info("Scheduling a job to run at $at")

        val context = ExecutionContext.get()
        val message =
            QuartzMessage(
                id = id,
                contestId = context.contestId,
                traceId = context.traceId,
                payload = payload,
            )

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
     * @param id The ID of the job to be cancelled.
     */
    override fun cancel(id: String) {
        logger.info("Attempting to cancel job with id $id")

        if (scheduler.checkExists(JobKey.jobKey(id))) {
            scheduler.deleteJob(JobKey.jobKey(id))
            logger.info("Job cancelled successfully")
        } else {
            logger.warn("Job does not exist")
        }
    }
}
