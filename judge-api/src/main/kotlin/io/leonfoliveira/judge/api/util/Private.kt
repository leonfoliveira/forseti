package io.leonfoliveira.judge.api.util

import io.leonfoliveira.judge.core.domain.entity.Member

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class Private(vararg val allowed: Member.Type = [])
