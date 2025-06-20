package io.github.leonfoliveira.judge.common.event

import io.github.leonfoliveira.judge.common.domain.entity.Clarification
import org.springframework.context.ApplicationEvent

class ClarificationEvent(
    source: Any,
    val clarification: Clarification,
    val isDeleted: Boolean = false,
) : ApplicationEvent(source)
