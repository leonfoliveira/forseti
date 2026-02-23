package com.forsetijudge.core.port.driven.scheduler

import com.forsetijudge.core.port.driven.scheduler.payload.AutoFreezeJobPayload

/**
 * A specialized [JobScheduler] for scheduling auto-freeze jobs for contests.
 */
interface AutoFreezeJobScheduler : JobScheduler<AutoFreezeJobPayload>
