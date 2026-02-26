package com.forsetijudge.core.port.driven.job

import java.io.Serializable
import java.time.OffsetDateTime

interface JobScheduler<TPayload : Serializable> {
    /**
     * Schedules a job with the given [id], [payload] and execution time [at].
     *
     * The [id] should be unique for each scheduled job. If a job with the same [id] already exists, it will be replaced with the new one.
     * The [payload] will be passed to the job executor when the job is executed.
     * The [at] parameter specifies the time when the job should be executed. It must be in the future, otherwise the job will be executed immediately.
     */
    fun schedule(
        id: String,
        payload: TPayload,
        at: OffsetDateTime,
    )

    /**
     * Cancels the job with the given [id]. If no job with the [id] exists, this method does nothing.
     * The [id] should be the same as the one used when scheduling the job.
     * After calling this method, the job will not be executed even if the scheduled time has passed.
     */
    fun cancel(id: String)
}
