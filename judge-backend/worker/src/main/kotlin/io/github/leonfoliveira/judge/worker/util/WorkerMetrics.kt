package io.github.leonfoliveira.judge.worker.util

class WorkerMetrics {
    companion object {
        const val WORKER_RECEIVED_SUBMISSION = "worker_received_submission"
        const val WORKER_SUCCESSFUL_SUBMISSION = "worker_successful_submission"
        const val WORKER_FAILED_SUBMISSION = "worker_failed_submission"
        const val WORKER_SUBMISSION_RUN_TIME = "worker_submission_run_time"
    }

    private constructor() {}
}
