package com.forsetijudge.core.domain.event

import org.springframework.context.ApplicationEvent

open class BusinessEvent<TPayload>(
    val payload: TPayload,
) : ApplicationEvent(Any())
