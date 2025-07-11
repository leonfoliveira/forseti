package io.github.leonfoliveira.judge.common.util

/**
 * Annotation to mark classes, functions, or constructors that should be skipped during code coverage analysis.
 */
@Retention(AnnotationRetention.RUNTIME)
@Target(
    AnnotationTarget.CLASS,
    AnnotationTarget.FUNCTION,
    AnnotationTarget.CONSTRUCTOR
)
annotation class GeneratedSkipCoverage()
