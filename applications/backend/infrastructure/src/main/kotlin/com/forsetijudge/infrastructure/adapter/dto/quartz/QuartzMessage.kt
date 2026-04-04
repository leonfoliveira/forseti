package com.forsetijudge.infrastructure.adapter.dto.quartz

import com.forsetijudge.core.domain.model.ExecutionContext
import java.io.Serializable
import java.util.UUID

/**
 * A generic Quartz message wrapper that includes a unique identifier for tracking.
 *
 * @param TBody The type of the payload contained in the message, which must be serializable.
 * @property id A unique identifier for the message.
 * @property traceId A trace ID for tracking purposes.
 * @property body The actual payload of the message, which must be serializable.
 */
data class QuartzMessage<TBody : Serializable>(
    val id: String,
    val contestId: UUID? = ExecutionContext.getContestIdNullable(),
    val traceId: String = ExecutionContext.get().traceId,
    val body: TBody,
)
