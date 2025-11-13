package io.github.leonfoliveira.forseti.autojudge.util

class AutoJudgeMetrics {
    companion object {
        // Total number of received submissions
        const val AUTO_JUDGE_RECEIVED_SUBMISSION = "auto_judge_received_submission"

        // Total number of successfully judged submissions
        const val AUTO_JUDGE_SUCCESSFUL_SUBMISSION = "auto_judge_successful_submission"

        // Total number of failed judged submissions
        const val AUTO_JUDGE_FAILED_SUBMISSION = "auto_judge_failed_submission"

        // Histogram of submission run time
        const val AUTO_JUDGE_SUBMISSION_RUN_TIME = "auto_judge_submission_run_time"
    }

    private constructor() {}
}
