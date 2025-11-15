package io.github.leonfoliveira.forseti.common.application.domain.event

import io.github.leonfoliveira.forseti.common.application.domain.entity.Clarification
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a new clarification is created
 */
class ClarificationCreatedEvent(
    source: Any,
    val clarification: Clarification,
) : ApplicationEvent(source)
