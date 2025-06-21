package io.github.leonfoliveira.judge.worker.consumer

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.github.leonfoliveira.judge.common.adapter.aws.SqsConsumer
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsMessage
import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsSubmissionPayload
import io.github.leonfoliveira.judge.common.domain.exception.InternalServerException
import io.github.leonfoliveira.judge.common.service.submission.FindSubmissionService
import io.github.leonfoliveira.judge.worker.service.RunSubmissionService
import io.github.leonfoliveira.judge.worker.util.WorkerMetrics
import io.micrometer.core.instrument.MeterRegistry
import jakarta.annotation.PostConstruct
import jakarta.annotation.PreDestroy
import java.util.UUID
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import java.util.function.Supplier
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
    private val meterRegistry: MeterRegistry,
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

    private final val waitTimer = meterRegistry.timer(WorkerMetrics.WORKER_SUBMISSION_WAIT_TIME.toString())
    private final val runTimer = meterRegistry.timer(WorkerMetrics.WORKER_SUBMISSION_RUN_TIME.toString())
    private final val waitingSubmissions = AtomicInteger(0)
    private final val processingSubmissions = AtomicInteger(0)

    init {
        meterRegistry.gauge(WorkerMetrics.WORKER_WAITING_SUBMISSION.toString(), this) { waitingSubmissions.get().toDouble() }
        meterRegistry.gauge(WorkerMetrics.WORKER_PROCESSING_SUBMISSION.toString(), this) { processingSubmissions.get().toDouble() }
        meterRegistry.gauge(WorkerMetrics.WORKER_MAX_CPU.toString(), this) { maxCpu }
        meterRegistry.gauge(WorkerMetrics.WORKER_MAX_MEMORY.toString(), this) { maxMemory.toDouble() }
        meterRegistry.gauge(WorkerMetrics.WORKER_RESERVED_CPU.toString(), this) { reservedCpu }
        meterRegistry.gauge(WorkerMetrics.WORKER_RESERVED_MEMORY.toString(), this) { reservedMemory.toDouble() }
        meterRegistry.gauge(WorkerMetrics.WORKER_JVM_FREE_MEMORY.toString(),this) {
            val jvmFreeMemory = Runtime.getRuntime().freeMemory() / 1024L / 1024L
            jvmFreeMemory.toDouble()
        }
    }

    @PostConstruct
    fun start() {
        logger.info("Starting submission consumer")
        scheduledExecutor.scheduleWithFixedDelay({
            poll()
        }, 0, 1000, TimeUnit.MILLISECONDS)
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
        logger.info("Polling for messages from SQS queue: {}", queueUrl)
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

        meterRegistry.counter(WorkerMetrics.WORKER_RECEIVED_SUBMISSION.toString()).increment()

        if (!hasResource(requiredCpu, requiredMemory)) {
            try {
                waitingSubmissions.incrementAndGet()
                waitTimer.record(Supplier {
                    while (!hasResource(requiredCpu, requiredMemory)) {
                        logger.info("Waiting for resources to be available...")
                        Thread.sleep(1000)
                    }
                })
            } finally {
                waitingSubmissions.decrementAndGet()
            }
        }

        reservedCpu += requiredCpu
        reservedMemory += requiredMemory

        executor.submit {
            try {
                processingSubmissions.incrementAndGet()
                runTimer.record(Supplier {
                    runSubmissionService.run(submission)
                })
                meterRegistry.counter(WorkerMetrics.WORKER_SUCCESSFUL_SUBMISSION.toString()).increment()
            } catch (ex: Exception) {
                meterRegistry.counter(WorkerMetrics.WORKER_FAILED_SUBMISSION.toString()).increment()
                logger.error("Error running submission: ${submission.id}", ex)
            } finally {
                reservedCpu -= requiredCpu
                reservedMemory -= requiredMemory
                logger.info("Resources released for submission: ${submission.id}")
                processingSubmissions.decrementAndGet()
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
            meterRegistry.counter(WorkerMetrics.WORKER_SUBMISSION_STARVED.toString()).increment()
            throw InternalServerException("Not enough free memory in the JVM")
        }

        logger.info("Resources are available, proceeding...")
        return true
    }
}