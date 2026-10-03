package com.forsetijudge.core.util

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.Logger
import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.core.read.ListAppender
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.slf4j.LoggerFactory

class SafeLoggerTest {
    private val logger = SafeLogger(SafeLoggerTest::class)
    private val backendLogger = LoggerFactory.getLogger(SafeLoggerTest::class.java) as Logger

    @Test
    fun `sanitizes control characters for info and warning messages`() {
        withCapturedEvents { events ->
            logger.info("line1\nline2\r\n\tend")
            logger.warn("warning\nline")

            assertEquals("line1\\nline2\\r\\n\\tend", events[0].formattedMessage)
            assertEquals(Level.INFO, events[0].level)
            assertEquals("warning\\nline", events[1].formattedMessage)
            assertEquals(Level.WARN, events[1].level)
        }
    }

    @Test
    fun `truncates sanitized messages to one thousand characters`() {
        withCapturedEvents { events ->
            logger.info("a".repeat(999) + "\n" + "b")

            assertEquals(1000, events.single().formattedMessage.length)
            assertEquals("a".repeat(999) + "\\", events.single().formattedMessage)
        }
    }

    @Test
    fun `logs errors with and without throwable`() {
        val failure = IllegalStateException("failure")
        withCapturedEvents { events ->
            logger.error("error\nmessage")
            logger.error("exception\nmessage", failure)

            assertEquals(2, events.size)
            assertEquals("error\\nmessage", events[0].formattedMessage)
            assertEquals(Level.ERROR, events[0].level)
            assertEquals("exception\\nmessage", events[1].formattedMessage)
            assertEquals("IllegalStateException", events[1].throwableProxy.className.substringAfterLast('.'))
            assertEquals("failure", events[1].throwableProxy.message)
        }
    }

    private fun withCapturedEvents(action: (List<ILoggingEvent>) -> Unit) {
        val previousLevel = backendLogger.level
        val appender = ListAppender<ILoggingEvent>().apply { start() }
        backendLogger.level = Level.TRACE
        backendLogger.addAppender(appender)
        try {
            action(appender.list)
        } finally {
            backendLogger.detachAppender(appender)
            appender.stop()
            backendLogger.level = previousLevel
        }
    }
}
