package io.github.leonfoliveira.judge.autojudge.event

import io.github.leonfoliveira.judge.common.domain.entity.Submission
import org.springframework.context.ApplicationEvent

class SubmissionJudgedEvent(
    source: Any,
    val submission: Submission,
    val answer: Submission.Answer,
) : ApplicationEvent(source)
