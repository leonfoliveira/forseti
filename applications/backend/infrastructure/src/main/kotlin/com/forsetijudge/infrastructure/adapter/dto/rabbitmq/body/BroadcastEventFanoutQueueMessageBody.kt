package com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
data class BroadcastEventFanoutQueueMessageBody(
    val room: String,
    val name: String,
    val data: Serializable? = null,
) : Serializable
