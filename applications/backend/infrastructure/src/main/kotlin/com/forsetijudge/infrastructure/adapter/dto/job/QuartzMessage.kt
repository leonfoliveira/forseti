package com.forsetijudge.infrastructure.adapter.dto.job

import com.forsetijudge.core.application.util.IdUtil
import io.opentelemetry.api.trace.Span
import java.io.Serializable

/**
 * A generic Quartz message wrapper that includes a unique identifier for tracking.
 *
 * @param TPayload The type of the payload contained in the message, which must be serializable.
 * @property id A unique identifier for the message, generated as a UUIDv7 by default.
 * @property traceId An optional trace ID for tracking purposes. Default value is retrieved from the current span.
 * @property payload The actual payload of the message.
 * @property retries The number of times the message has been retried. Default is 0.
 */
data class QuartzMessage<TPayload : Serializable>(
    val id: String = IdUtil.getUUIDv7().toString(),
    val traceId: String = Span.current().spanContext.traceId,
    val payload: TPayload,
    val retries: Int = 0,
)
