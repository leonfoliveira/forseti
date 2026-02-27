package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.forsetijudge.core.port.driven.job.AttachmentBucketCleanerJobScheduler
import com.forsetijudge.infrastructure.adapter.driving.job.AttachmentBucketCleanerQuartzJob
import org.springframework.stereotype.Component
import java.io.Serializable

@Component
class AttachmentBucketCleanerQuartzJobScheduler :
    QuartzJobScheduler<Serializable>(AttachmentBucketCleanerQuartzJob::class.java),
    AttachmentBucketCleanerJobScheduler
