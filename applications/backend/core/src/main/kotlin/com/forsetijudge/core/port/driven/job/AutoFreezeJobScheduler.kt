package com.forsetijudge.core.port.driven.job

import com.forsetijudge.core.port.driven.job.payload.AutoFreezeJobPayload

/**
 * A specialized [JobScheduler] for scheduling auto-freeze jobs for contests.
 */
interface AutoFreezeJobScheduler : JobScheduler<AutoFreezeJobPayload>
