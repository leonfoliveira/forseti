package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Submission
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a new submission is created
 */
class SubmissionCreatedEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)
