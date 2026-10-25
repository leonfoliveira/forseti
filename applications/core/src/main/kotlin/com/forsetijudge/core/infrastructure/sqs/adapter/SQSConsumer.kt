package com.forsetijudge.core.infrastructure.sqs.adapter

import com.forsetijudge.core.util.SafeLogger
import io.opentelemetry.api.GlobalOpenTelemetry
import io.opentelemetry.api.trace.SpanKind
import io.opentelemetry.api.trace.StatusCode
import org.springframework.context.SmartLifecycle
import software.amazon.awssdk.services.sqs.SqsClient
import software.amazon.awssdk.services.sqs.model.DeleteMessageRequest
import software.amazon.awssdk.services.sqs.model.Message
import software.amazon.awssdk.services.sqs.model.ReceiveMessageRequest
import java.util.concurrent.atomic.AtomicBoolean

abstract class SQSConsumer(
    private val sqsClient: SqsClient,
    private val queueUrl: String,
) : SmartLifecycle {
    private val logger = SafeLogger(this::class)

    private val tracer =
        GlobalOpenTelemetry.get().getTracer(this::class.java.packageName)

    private val running = AtomicBoolean(false)

    @Volatile
    private var worker: Thread? = null

    override fun start() {
        if (!running.compareAndSet(false, true)) return

        worker =
            Thread(
                { poll() },
                this.javaClass.name,
            ).apply {
                isDaemon = false
                start()
            }
    }

    private fun poll() {
        while (running.get() &&
            !Thread.currentThread().isInterrupted
        ) {
            try {
                val request =
                    ReceiveMessageRequest
                        .builder()
                        .queueUrl(queueUrl)
                        .build()

                val messages =
                    sqsClient
                        .receiveMessage(request)
                        .messages()

                messages.forEach(::processMessage)
            } catch (e: Exception) {
                if (running.get()) {
                    logger.error("Failed to poll SQS", e)
                    backoff()
                }
            }
        }
    }

    private fun processMessage(message: Message) {
        val parentContext = SQSTraceContext.extract(message)

        val span =
            tracer
                .spanBuilder("sqs.process")
                .setParent(parentContext)
                .setSpanKind(SpanKind.CONSUMER)
                .startSpan()

        try {
            span.makeCurrent().use {
                span.setAttribute(
                    "messaging.system",
                    "aws_sqs",
                )
                span.setAttribute(
                    "messaging.operation.type",
                    "process",
                )

                message.messageId()?.let {
                    span.setAttribute("messaging.message.id", it)
                }

                val traceId = span.spanContext.traceId

                logger.info(
                    "Received SQS message id=${message.messageId()}, traceId=$traceId",
                )

                handle(message.body())

                sqsClient.deleteMessage(
                    DeleteMessageRequest
                        .builder()
                        .queueUrl(queueUrl)
                        .receiptHandle(message.receiptHandle())
                        .build(),
                )

                logger.info(
                    "Successfully processed SQS message id=${message.messageId()}, traceId=$traceId",
                )
            }
        } catch (e: Exception) {
            span.recordException(e)
            span.setStatus(StatusCode.ERROR, "Failed to process SQS message")
            logger.error(
                "Failed to process SQS message id=${message.messageId()}, " +
                    "traceId=${span.spanContext.traceId}",
                e,
            )
        } finally {
            span.end()
        }
    }

    private fun backoff() {
        try {
            Thread.sleep(1_000)
        } catch (_: InterruptedException) {
            Thread.currentThread().interrupt()
        }
    }

    override fun stop() {
        running.set(false)
        worker?.interrupt()

        try {
            worker?.join(5_000)
        } catch (_: InterruptedException) {
            Thread.currentThread().interrupt()
        }

        worker = null
    }

    override fun stop(callback: Runnable) {
        stop()
        callback.run()
    }

    override fun isRunning(): Boolean = running.get()

    override fun isAutoStartup(): Boolean = true

    override fun getPhase(): Int = 0

    abstract fun handle(body: String)
}
