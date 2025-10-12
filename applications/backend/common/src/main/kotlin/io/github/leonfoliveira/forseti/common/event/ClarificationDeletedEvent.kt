package io.github.leonfoliveira.forseti.common.event

import io.github.leonfoliveira.forseti.common.domain.entity.Clarification
import org.springframework.context.ApplicationEvent

class ClarificationDeletedEvent(
    source: Any,
    val clarification: Clarification,
) : ApplicationEvent(source)
