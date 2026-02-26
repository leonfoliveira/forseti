package com.forsetijudge.core.application.util

import org.slf4j.LoggerFactory
import kotlin.reflect.KClass

/**
 * A logger that sanitizes log messages to prevent log injection attacks.
 * It replaces newlines, carriage returns, and tabs with their escaped versions,
 * and truncates messages to a maximum length of 1000 characters.
 */
class SafeLogger(
    clazz: KClass<*>,
) {
    private val logger = LoggerFactory.getLogger(clazz.java)

    /** Logs an informational message after sanitizing it. */
    fun info(message: String) {
        logger.info(sanitize(message))
    }

    /** Logs a warning message after sanitizing it. */
    fun warn(message: String) {
        logger.warn(sanitize(message))
    }

    /** Logs an error message after sanitizing it, optionally including a throwable. */
    fun error(
        message: String,
        throwable: Throwable? = null,
    ) {
        if (throwable == null) {
            logger.error(sanitize(message))
        } else {
            logger.error(sanitize(message), throwable)
        }
    }

    /** Sanitizes a log message by escaping special characters and truncating it. */
    private fun sanitize(message: String): String =
        message
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t")
            .take(1000)
}
