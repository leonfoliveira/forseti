package com.forsetijudge.core.config

/**
 * Annotation to indicate that code coverage tools should skip the annotated class.
 */
@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class SkipCoverage
