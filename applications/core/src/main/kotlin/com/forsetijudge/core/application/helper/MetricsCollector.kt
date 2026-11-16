package com.forsetijudge.core.application.helper

import com.forsetijudge.core.util.Metrics
import io.opentelemetry.api.common.Attributes
import java.util.UUID
import org.springframework.stereotype.Component

@Component
class MetricsCollector {
    fun incrementSubmissionsCreated(contestId: UUID) {
        Metrics.submissionsCreated.add(1, Attributes.builder().put("contestId", contestId.toString()).build())
    }

    fun incrementSubmissionsJudged(contestId: UUID) {
        Metrics.submissionsJudged.add(1, Attributes.builder().put("contestId", contestId.toString()).build())
    }

    fun incrementSubmissionsFailed(contestId: UUID) {
        Metrics.submissionsFailed.add(1, Attributes.builder().put("contestId", contestId.toString()).build())
    }
}
