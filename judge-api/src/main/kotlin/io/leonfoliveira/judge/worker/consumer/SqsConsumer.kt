package io.leonfoliveira.judge.worker.consumer

import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import java.util.UUID

abstract class SqsConsumer<TMessage> {
    private val logger = LoggerFactory.getLogger(SqsConsumer::class.java)

    @Transactional
    open fun receiveMessage(
        message: TMessage,
        headers: Map<String, Any>,
    ) {
        val traceId =
            headers["MessageAttributes.traceId.StringValue"] as? String
                ?: UUID.randomUUID().toString()
        MDC.put("traceId", traceId)

        logger.info("Received message: {}", message)

        try {
            handleMessage(message)
        } catch (ex: Exception) {
            logger.error("Error thrown from consumer {}: {}", this.javaClass.simpleName, ex.message)
            throw ex
        } finally {
            MDC.clear()
        }
    }

    abstract fun handleMessage(message: TMessage)
}
