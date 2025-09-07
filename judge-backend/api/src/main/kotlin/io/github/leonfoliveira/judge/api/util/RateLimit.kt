package io.github.leonfoliveira.judge.api.util

/**
 * Annotation to enable rate limiting on endpoints.
 *
 * @param requestsPerMinute Maximum number of requests allowed per minute (default: 60)
 * @param requestsPerHour Maximum number of requests allowed per hour (default: 1000)
 * @param burstCapacity Maximum burst capacity for requests (default: 10)
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class RateLimit(
    val requestsPerMinute: Int = 60,
    val requestsPerHour: Int = 1000,
    val burstCapacity: Int = 10,
)
