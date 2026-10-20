package com.forsetijudge.core.application.helper

import com.forsetijudge.core.util.Metrics
import com.forsetijudge.core.util.SkipCoverage
import io.opentelemetry.api.common.Attributes
import org.springframework.stereotype.Component
import java.util.UUID

@Component
@SkipCoverage
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
