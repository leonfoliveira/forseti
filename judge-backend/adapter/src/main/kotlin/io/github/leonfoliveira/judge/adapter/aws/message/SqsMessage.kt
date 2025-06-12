package io.github.leonfoliveira.judge.adapter.aws.message

import org.slf4j.MDC
import java.io.Serializable
import java.util.UUID

data class SqsMessage<TPayload : Serializable>(
    val id: UUID = UUID.randomUUID(),
    val traceId: String? = MDC.get("traceId"),
    val payload: TPayload,
) : Serializable
