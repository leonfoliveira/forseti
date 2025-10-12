package io.github.leonfoliveira.forseti.common.event

import io.github.leonfoliveira.forseti.common.domain.entity.Submission
import org.springframework.context.ApplicationEvent

class SubmissionUpdatedEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)
