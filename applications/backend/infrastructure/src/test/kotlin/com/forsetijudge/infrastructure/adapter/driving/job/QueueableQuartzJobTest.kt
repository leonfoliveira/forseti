package com.forsetijudge.infrastructure.adapter.driving.job

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.config.JacksonConfig
import com.forsetijudge.infrastructure.adapter.driven.rabbitmq.RabbitMQProducer
import com.forsetijudge.infrastructure.adapter.dto.quartz.QuartzMessage
import com.forsetijudge.infrastructure.adapter.dto.quartz.body.QueueableJobMessageBody
import com.forsetijudge.infrastructure.adapter.dto.rabbitmq.RabbitMQMessage
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.quartz.JobExecutionException
import java.io.Serializable

class QueueableQuartzJobTest :
    FunSpec({
        val rabbitMQProducer = mockk<RabbitMQProducer>(relaxed = true)
        val objectMapper = JacksonConfig().objectMapper()
        val maxRetries = 1

        val sut =
            QueueableQuartzJob(
                rabbitMQProducer = rabbitMQProducer,
                objectMapper = objectMapper,
                maxRetries = maxRetries,
            )

        test("should produce message to RabbitMQ") {
            val body =
                QueueableJobMessageBody(
                    exchange = "test-exchange",
                    routingKey = "test-routing-key",
                    body = "test-body",
                )
            val message =
                QuartzMessage(
                    id = IdGenerator.getUUID().toString(),
                    contestId = IdGenerator.getUUID(),
                    traceId = IdGenerator.getTraceId(),
                    body = body,
                )

            val dataMap = JobDataMap()
            dataMap.put("id", message.id)
            dataMap.put("contestId", message.contestId.toString())
            dataMap.put("traceId", message.traceId)
            dataMap.put("body", objectMapper.writeValueAsString(message.body))
            val context = mockk<JobExecutionContext>(relaxed = true)
            every { context.mergedJobDataMap } returns dataMap

            sut.executeInternal(context)

            verify {
                rabbitMQProducer.produce(
                    match<RabbitMQMessage<Serializable>> {
                        it.contestId == message.contestId &&
                            it.traceId == message.traceId &&
                            it.exchange == body.exchange &&
                            it.routingKey == body.routingKey &&
                            it.body == body.body
                    },
                )
            }
        }
    })
