package io.leonfoliveira.judge.worker.consumer

import org.slf4j.LoggerFactory

abstract class SqsConsumer {
    private val logger = LoggerFactory.getLogger(SqsConsumer::class.java)

    fun handleException(ex: Exception) {
        logger.error("Error thrown from consumer {}: {}", this.javaClass.simpleName, ex.message)
    }

    abstract fun receiveMessage(message: String)
}
