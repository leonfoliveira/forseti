package io.github.leonfoliveira.judge.api.util

/**
 * Annotation to enable rate limiting on endpoints.
 *
 * @param perMinute Maximum number of requests allowed per minute (default: 60)
 * @param perHour Maximum number of requests allowed per hour (default: 1000)
 * @param burst Maximum burst capacity for requests (default: 10)
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class RateLimit(
    val perMinute: Int = 60,
    val perHour: Int = 1000,
    val burst: Int = 10,
)
