package com.forsetijudge.core.config.logging

import ch.qos.logback.classic.PatternLayout
import ch.qos.logback.classic.spi.ILoggingEvent
import com.forsetijudge.core.config.SkipCoverage

/**
 * Custom PatternLayout that sanitizes log messages automatically.
 * This approach sanitizes messages at the formatting level.
 */
@SkipCoverage
class SanitizingPatternLayout : PatternLayout() {
    /**
     * Sanitizes input to prevent log injection attacks.
     *
     * @param message The original log message.
     * @return The sanitized log message.
     */
    private fun sanitizeLogMessage(message: String?): String =
        message
            ?.replace("\n", "\\n")
            ?.replace("\r", "\\r")
            ?.replace("\t", "\\t")
            ?.replace("\u0000", "\\0")
            ?.take(1000)
            ?: "null"

    override fun doLayout(event: ILoggingEvent): String {
        // Create a sanitized version of the event
        val sanitizedEvent = SanitizedLoggingEvent(event, sanitizeLogMessage(event.message))
        return super.doLayout(sanitizedEvent)
    }
}
