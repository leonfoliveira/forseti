package io.github.leonfoliveira.judge.core.event

import io.github.leonfoliveira.judge.core.domain.entity.Clarification
import org.springframework.context.ApplicationEvent

class ClarificationEvent(
    source: Any,
    val clarification: Clarification,
) : ApplicationEvent(source)
