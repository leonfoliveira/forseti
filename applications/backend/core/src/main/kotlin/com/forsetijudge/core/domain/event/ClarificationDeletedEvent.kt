package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Clarification
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a clarification is deleted
 */
class ClarificationDeletedEvent(
    source: Any,
    val clarification: Clarification,
) : ApplicationEvent(source)
