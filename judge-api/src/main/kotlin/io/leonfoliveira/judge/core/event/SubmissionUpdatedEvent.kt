package io.leonfoliveira.judge.core.event

import io.leonfoliveira.judge.core.domain.entity.Submission
import io.leonfoliveira.judge.core.port.SubmissionEmitterAdapter
import org.springframework.context.ApplicationEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

class SubmissionUpdatedEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)

@Component
class SubmissionUpdatedEventListener(
    private val submissionEmitterAdapter: SubmissionEmitterAdapter,
) {
    @EventListener
    fun onApplicationEvent(event: SubmissionUpdatedEvent) {
        submissionEmitterAdapter.emitForMember(event.submission)
        submissionEmitterAdapter.emitForContest(event.submission)
    }
}
