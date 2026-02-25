package com.forsetijudge.infrastructure.adapter.driven.quartz

import com.forsetijudge.core.port.driven.job.AutoFreezeJobScheduler
import com.forsetijudge.core.port.driven.job.payload.AutoFreezeJobPayload
import com.forsetijudge.infrastructure.adapter.driving.job.AutoFreezeQuartzJob
import org.springframework.stereotype.Component

@Component
class AutoFreezeQuartzJobScheduler :
    QuartzJobScheduler<AutoFreezeJobPayload>(AutoFreezeQuartzJob::class.java),
    AutoFreezeJobScheduler
