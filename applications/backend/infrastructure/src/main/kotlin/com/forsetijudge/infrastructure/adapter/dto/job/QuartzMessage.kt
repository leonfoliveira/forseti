package com.forsetijudge.infrastructure.adapter.dto.job

import java.io.Serializable
import java.util.UUID

/**
 * A generic Quartz message wrapper that includes a unique identifier for tracking.
 *
 * @param TPayload The type of the payload contained in the message, which must be serializable.
 * @property id A unique identifier for the message.
 * @property traceId A trace ID for tracking purposes.
 * @property payload The actual payload of the message.
 * @property retries The number of times the message has been retried. Default is 0.
 */
data class QuartzMessage<TPayload : Serializable>(
    val id: String,
    val contestId: UUID?,
    val traceId: String,
    val payload: TPayload,
    val retries: Int = 0,
)
