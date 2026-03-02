package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.fasterxml.jackson.databind.ObjectMapper
import com.forsetijudge.core.application.util.SafeLogger
import com.forsetijudge.infrastructure.adapter.dto.quartz.QuartzMessage
import org.quartz.Job
import org.quartz.JobBuilder
import org.quartz.JobKey
import org.quartz.Scheduler
import org.quartz.SimpleScheduleBuilder
import org.quartz.TriggerBuilder
import org.springframework.stereotype.Component
import java.time.Duration
import java.time.OffsetDateTime
import java.util.Date
import kotlin.reflect.KClass

@Component
class QuartzJobScheduler(
    private var scheduler: Scheduler,
    private var objectMapper: ObjectMapper,
) {
    private val logger = SafeLogger(this::class)

    fun schedule(
        jobClass: KClass<out Job>,
        message: QuartzMessage<*>,
        at: OffsetDateTime,
    ) {
        logger.info("Scheduling job with id ${message.id} to run at $at on job class ${jobClass.simpleName}")

        val jobDetail =
            JobBuilder
                .newJob(jobClass.java)
                .withIdentity(message.id)
                .usingJobData("id", message.id)
                .usingJobData("contestId", message.contestId.toString())
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

        scheduler.scheduleJob(jobDetail, setOf(trigger), true)

        logger.info("Job scheduled successfully")
    }

    fun schedule(
        jobClass: KClass<out Job>,
        message: QuartzMessage<*>,
        interval: Duration,
        startAt: OffsetDateTime,
    ) {
        logger.info(
            "Scheduling a job with id ${message.id} to run every $interval starting at $startAt on job class ${jobClass.simpleName}",
        )

        val jobDetail =
            JobBuilder
                .newJob(jobClass.java)
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
                .startAt(Date.from(startAt.toInstant()))
                .withSchedule(
                    SimpleScheduleBuilder
                        .simpleSchedule()
                        .withIntervalInMilliseconds(interval.toMillis())
                        .repeatForever()
                        .withMisfireHandlingInstructionFireNow(),
                ).build()

        scheduler.scheduleJob(jobDetail, setOf(trigger), true)

        logger.info("Job scheduled successfully")
    }

    fun cancel(id: String) {
        logger.info("Attempting to cancel job with id $id")

        if (scheduler.checkExists(JobKey.jobKey(id))) {
            scheduler.deleteJob(JobKey.jobKey(id))
            logger.info("Job cancelled successfully")
        } else {
            logger.warn("Job does not exist")
        }
    }
}
