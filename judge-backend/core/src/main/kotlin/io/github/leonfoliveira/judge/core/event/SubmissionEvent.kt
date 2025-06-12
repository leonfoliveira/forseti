package io.github.leonfoliveira.judge.core.event

import io.github.leonfoliveira.judge.core.domain.entity.Submission
import org.springframework.context.ApplicationEvent

class SubmissionEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)
