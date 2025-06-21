package io.github.leonfoliveira.judge.worker.consumer

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.github.leonfoliveira.judge.common.adapter.aws.SqsConsumer
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsMessage
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsSubmissionPayload
import io.github.leonfoliveira.judge.common.domain.exception.InternalServerException
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import io.github.leonfoliveira.judge.worker.service.RunSubmissionService
import jakarta.annotation.PostConstruct
import jakarta.annotation.PreDestroy
import java.util.UUID
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.services.sqs.SqsClient

@Service
class SubmissionConsumer(
    private val sqsClient: SqsClient,
    @Value("\${spring.cloud.aws.sqs.submission-queue}")
    private val queueUrl: String,
    @Value("\${auto-judge.cpu-per-submission}")
    private val cpuPerSubmission: Double,
    @Value("\${auto-judge.max-cpu}")
    private val maxCpu: Double,
    @Value("\${auto-judge.max-memory}")
    private val maxMemory: Long,
    private val findSubmissionService: FindSubmissionService,
    private val runSubmissionService: RunSubmissionService,
) {
    private final val logger = LoggerFactory.getLogger(SqsConsumer::class.java)
    private final val scheduledExecutor = Executors.newSingleThreadScheduledExecutor()
    private final val executor = Executors.newCachedThreadPool()
    private final val objectMapper = jacksonObjectMapper()
    private final val messageRef = object : TypeReference<SqsMessage<SqsSubmissionPayload>>() {}

    private final var reservedCpu: Double = 0.0
    private final var reservedMemory: Long = 0

    @PostConstruct
    fun start() {
        logger.info("Starting submission consumer")
        scheduledExecutor.scheduleWithFixedDelay({
            poll()
        }, 0, 1000, TimeUnit.MILLISECONDS)
        logger.info("Finishing submission consumer")
    }

    @PreDestroy
    fun shutdown() {
        logger.info("Shutting down submission consumer")
        scheduledExecutor.shutdown()
        executor.shutdown()
        try {
            if (!scheduledExecutor.awaitTermination(60, TimeUnit.SECONDS)) {
                scheduledExecutor.shutdownNow()
                if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                    executor.shutdownNow()
                    logger.error("Executors did not terminate")
                }
            }
        } catch (ex: InterruptedException) {
            scheduledExecutor.shutdownNow()
            executor.shutdownNow()
            Thread.currentThread().interrupt()
        }
        logger.info("Submission consumer shutdown complete")
    }

    private fun poll() {
        val messages = sqsClient.receiveMessage {
            it.queueUrl(queueUrl)
                .maxNumberOfMessages(1)
                .waitTimeSeconds(10)
        }.messages()

        if (messages.isEmpty()) {
            return
        }

        try {
            val rawMessage = messages.first()
            val message = objectMapper.readValue(rawMessage.body(), messageRef)
            receiveMessage(message)
            sqsClient.deleteMessage {
                it.queueUrl(queueUrl)
                    .receiptHandle(rawMessage.receiptHandle())
            }
        } catch (ex: Exception) {
            logger.error("Error processing message", ex)
        }
    }

    private fun receiveMessage(message: SqsMessage<SqsSubmissionPayload>) {
        val traceId =
            message.traceId
                ?: UUID.randomUUID().toString()
        MDC.put("traceId", traceId)

        logger.info("Received message: {}", message)

        val submission = findSubmissionService.findById(message.payload.submissionId)
        val requiredCpu = cpuPerSubmission
        val requiredMemory = submission.problem.memoryLimit

        while (!hasResource(requiredCpu, requiredMemory)) {
            logger.info("Waiting for resources to be available...")
            Thread.sleep(1000)
        }

        reservedCpu += requiredCpu
        reservedMemory += requiredMemory

        executor.submit {
            try {
                runSubmissionService.run(submission)
            } catch (ex: Exception) {
                logger.error("Error running submission: ${submission.id}", ex)
            } finally {
                reservedCpu -= requiredCpu
                reservedMemory -= requiredMemory
                logger.info("Resources released for submission: ${submission.id}")
            }
        }
    }

    private fun hasResource(requiredCpu: Double, requiredMemory: Int): Boolean {
        logger.info("Reserved CPU: $reservedCpu/$maxCpu and memory: $reservedMemory/$maxMemory")
        logger.info("Requiring CPU: $requiredCpu and memory: $requiredMemory")

        val freeCpu = maxCpu - reservedCpu
        val freeMemory = maxMemory - reservedMemory

        if (requiredCpu > freeCpu || requiredMemory > freeMemory) {
            logger.warn("Not enough resources available")
            return false
        }

        val runtime = Runtime.getRuntime()
        val jvmFreeMemory = runtime.freeMemory() / 1024L / 1024L
        logger.info("JVM free memory: $jvmFreeMemory MB")
        if (requiredMemory > jvmFreeMemory) {
            throw InternalServerException("Not enough free memory in the JVM")
        }

        logger.info("Resources are available, proceeding...")
        return true
    }
}