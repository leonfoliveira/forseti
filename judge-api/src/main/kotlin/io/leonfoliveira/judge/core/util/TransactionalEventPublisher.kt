package io.leonfoliveira.judge.core.util

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager

@Component
class TransactionalEventPublisher(
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun publish(event: ApplicationEvent) {
        val runnable =
            Runnable {
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
