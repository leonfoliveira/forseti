package io.github.leonfoliveira.forseti.api.util

import io.github.leonfoliveira.forseti.common.domain.entity.Member

/**
 * Indicates that the annotated controller method or class is private and can only be accessed by one of the specified member types.
 * If no member types are specified, any signed-in member can access it.
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class Private(
    vararg val allowed: Member.Type = [],
)
