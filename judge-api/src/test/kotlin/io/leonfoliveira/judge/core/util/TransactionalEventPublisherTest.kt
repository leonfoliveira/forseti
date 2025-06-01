package io.leonfoliveira.judge.core.util

import io.kotest.core.spec.style.FunSpec
import io.mockk.Runs
import io.mockk.clearMocks
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.slot
import io.mockk.verify
import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager

class TransactionalEventPublisherTest : FunSpec({
    val applicationEventPublisher = mockk<ApplicationEventPublisher>(relaxed = true)

    val sut = TransactionalEventPublisher(applicationEventPublisher)

    class TestEvent(source: Any) : ApplicationEvent(source)

    beforeEach {
        clearMocks(applicationEventPublisher)
        mockkStatic(TransactionSynchronizationManager::class)
        every { TransactionSynchronizationManager.isSynchronizationActive() } returns false
        every { TransactionSynchronizationManager.registerSynchronization(any()) } just Runs
        every { TransactionSynchronizationManager.clearSynchronization() } just Runs
    }

    test("When no transaction is active, event is published immediately") {
        val testEvent = TestEvent(this)
        every { TransactionSynchronizationManager.isSynchronizationActive() } returns false

        sut.publish(testEvent)

        verify(exactly = 1) { applicationEventPublisher.publishEvent(testEvent) }
        verify(exactly = 0) { TransactionSynchronizationManager.registerSynchronization(any()) }
    }

    test("When a transaction is active, event is published after commit") {
        val testEvent = TestEvent(this)
        every { TransactionSynchronizationManager.isSynchronizationActive() } returns true

        val synchronizationSlot = slot<TransactionSynchronization>()
        every { TransactionSynchronizationManager.registerSynchronization(capture(synchronizationSlot)) } just Runs

        sut.publish(testEvent)

        verify(exactly = 0) { applicationEventPublisher.publishEvent(any()) }
        verify(exactly = 1) { TransactionSynchronizationManager.registerSynchronization(any()) }

        synchronizationSlot.captured.afterCommit()

        verify(exactly = 1) { applicationEventPublisher.publishEvent(testEvent) }
    }
})
