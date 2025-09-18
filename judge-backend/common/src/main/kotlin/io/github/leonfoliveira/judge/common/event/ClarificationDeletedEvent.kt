package io.github.leonfoliveira.judge.common.event

import io.github.leonfoliveira.judge.common.domain.entity.Clarification
import org.springframework.context.ApplicationEvent

class ClarificationDeletedEvent(
    source: Any,
    val clarification: Clarification,
) : ApplicationEvent(source)
