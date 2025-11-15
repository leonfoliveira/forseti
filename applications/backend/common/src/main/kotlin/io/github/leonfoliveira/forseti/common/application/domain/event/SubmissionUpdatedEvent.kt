package io.github.leonfoliveira.forseti.common.application.domain.event

import io.github.leonfoliveira.forseti.common.application.domain.entity.Submission
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a submission is updated
 */
class SubmissionUpdatedEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)
