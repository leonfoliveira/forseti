package io.github.leonfoliveira.judge.common.util

import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager

@Component
class TransactionalEventPublisher(
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    fun publish(event: ApplicationEvent) {
        val runnable =
            Runnable {
                logger.info("Publishing event: ${event::class.java.simpleName}")
                applicationEventPublisher.publishEvent(event)
            }

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                object : TransactionSynchronization {
                    override fun afterCommit() {
                        runnable.run()
                    }
                },
            )
        } else {
            runnable.run()
        }
    }
}
