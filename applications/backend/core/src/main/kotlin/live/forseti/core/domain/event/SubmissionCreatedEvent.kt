package live.forseti.core.domain.event

import live.forseti.core.domain.entity.Submission
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a new submission is created
 */
class SubmissionCreatedEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)
