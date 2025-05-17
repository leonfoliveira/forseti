package io.leonfoliveira.judge.worker.consumer

import jakarta.transaction.Transactional
import org.slf4j.LoggerFactory

abstract class SqsConsumer {
    private val logger = LoggerFactory.getLogger(SqsConsumer::class.java)

    @Transactional
    open fun receiveMessage(message: String) {
        try {
            handleMessage(message)
        } catch (ex: Exception) {
            logger.error("Error thrown from consumer {}: {}", this.javaClass.simpleName, ex.message)
        }
    }

    abstract fun handleMessage(message: String)
}
