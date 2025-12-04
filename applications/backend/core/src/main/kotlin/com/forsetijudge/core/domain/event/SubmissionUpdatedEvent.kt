package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Submission
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a submission is updated
 */
class SubmissionUpdatedEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)
