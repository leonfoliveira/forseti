package io.github.leonfoliveira.judge.common.adapter.aws

import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsMessage
import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import java.io.Serializable
import java.util.UUID

abstract class SqsConsumer<TPayload : Serializable> {
    private val logger = LoggerFactory.getLogger(SqsConsumer::class.java)

    @Transactional
    open fun receiveMessage(message: SqsMessage<TPayload>) {
        val traceId =
            message.traceId
                ?: UUID.randomUUID().toString()
        MDC.put("traceId", traceId)

        logger.info("Received message: {}", message)

        try {
            handlePayload(message.payload)
        } catch (ex: Exception) {
            logger.error("Error thrown from consumer {}: {}", this.javaClass.simpleName, ex.message)
            throw ex
        } finally {
            MDC.clear()
        }
    }

    protected abstract fun handlePayload(payload: TPayload)
}
