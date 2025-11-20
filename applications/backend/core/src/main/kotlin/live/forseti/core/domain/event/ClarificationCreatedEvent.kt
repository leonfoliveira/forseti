package live.forseti.core.domain.event

import live.forseti.core.domain.entity.Clarification
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a new clarification is created
 */
class ClarificationCreatedEvent(
    source: Any,
    val clarification: Clarification,
) : ApplicationEvent(source)
