package com.forsetijudge.core.infrastructure.sqs.adapter

import io.opentelemetry.api.GlobalOpenTelemetry
import io.opentelemetry.context.Context
import io.opentelemetry.context.propagation.TextMapGetter
import io.opentelemetry.context.propagation.TextMapSetter
import software.amazon.awssdk.services.sqs.model.Message

object SQSTraceContext {
    private val propagator =
        GlobalOpenTelemetry.get().propagators.textMapPropagator

    private val setter =
        TextMapSetter<MutableMap<String, String>> { carrier, key, value -> carrier?.set(key, value) }

    private val getter =
        object : TextMapGetter<Map<String, String>> {
            override fun keys(carrier: Map<String, String>): Iterable<String> = carrier.keys

            override fun get(
                carrier: Map<String, String>?,
                key: String,
            ): String? = carrier?.get(key)
        }

    /**
     * Injects the current OTel context into a string map.
     * Typical fields include traceparent and tracestate.
     */
    fun inject(): Map<String, String> {
        val carrier = mutableMapOf<String, String>()
        propagator.inject(Context.current(), carrier, setter)
        return carrier
    }

    /**
     * Extracts the OTel context from SQS message attributes.
     */
    fun extract(message: Message): Context {
        val carrier =
            message
                .messageAttributes()
                .mapNotNull { (key, value) ->
                    value.stringValue()?.let { key to it }
                }.toMap()

        return propagator.extract(
            Context.root(),
            carrier,
            getter,
        )
    }
}
