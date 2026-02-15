package com.forsetijudge.infrastructure.adapter.dto.job.payload

import java.io.Serializable
import java.util.UUID

/**
 * Payload for the AutoFreezeJob, which contains the ID of the contest to be auto-frozen.
 *
 * @param contestId The unique identifier of the contest to be auto-frozen.
 */
data class AutoFreezeJobPayload(
    val contestId: UUID,
) : Serializable
