package io.github.leonfoliveira.forseti.api.util

import io.github.leonfoliveira.forseti.common.domain.entity.Member

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class Private(
    vararg val allowed: Member.Type = [],
)
