package com.forsetijudge.core.domain.event

import com.forsetijudge.core.domain.entity.Submission
import org.springframework.context.ApplicationEvent

/**
 * Event triggered when a submission is marked for rerun
 */
class SubmissionRerunEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)
