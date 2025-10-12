package io.github.leonfoliveira.forseti.common.event

import io.github.leonfoliveira.forseti.common.domain.entity.Submission
import org.springframework.context.ApplicationEvent

class SubmissionRerunEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)
