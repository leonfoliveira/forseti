package live.forseti.core.domain.event

import live.forseti.core.domain.entity.Submission
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a submission is updated
 */
class SubmissionUpdatedEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)
