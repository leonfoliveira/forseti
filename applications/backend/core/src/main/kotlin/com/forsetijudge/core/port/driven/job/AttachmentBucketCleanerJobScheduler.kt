package com.forsetijudge.core.port.driven.job

import kotlin.time.Duration

interface AttachmentBucketCleanerJobScheduler {
    fun schedule(interval: Duration)
}
