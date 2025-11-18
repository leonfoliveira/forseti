package io.github.leonfoliveira.forseti.autojudge.application.util

import io.prometheus.metrics.core.metrics.Counter
import io.prometheus.metrics.core.metrics.Histogram
import io.prometheus.metrics.model.snapshots.Unit

class AutoJudgeMetrics {
    companion object {
        val AUTO_JUDGE_RECEIVED_SUBMISSION: Counter =
            Counter
                .builder()
                .name("auto_judge_received_submission")
                .help("Total number of received submissions")
                .build()

        // Total number of successfully judged submissions
        val AUTO_JUDGE_SUCCESSFUL_SUBMISSION: Counter =
            Counter
                .builder()
                .name("auto_judge_successful_submission")
                .help("Total number of successfully judged submissions")
                .labelNames("answer")
                .build()

        // Total number of failed judged submissions
        val AUTO_JUDGE_FAILED_SUBMISSION: Counter =
            Counter
                .builder()
                .name("auto_judge_failed_submission")
                .help("Total number of failed judged submissions")
                .build()

        // Summary of submission run time
        val AUTO_JUDGE_SUBMISSION_RUN_TIME_SECONDS: Histogram =
            Histogram
                .builder()
                .name("auto_judge_submission_run_time_seconds")
                .help("Histogram of submission run time in seconds")
                .unit(Unit.SECONDS)
                .build()
    }

    private constructor() {}
}
