package com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.io.Serializable
import java.util.UUID

@JsonIgnoreProperties(ignoreUnknown = true)
data class BusinessEventQueueMessageBody(
    val id: UUID,
) : Serializable
