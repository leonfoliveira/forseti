package io.github.leonfoliveira.judge.common.event

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import org.springframework.context.ApplicationEvent

class SubmissionJudgeEvent(
    source: Any,
    val submission: Submission,
) : ApplicationEvent(source)
