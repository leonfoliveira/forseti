package com.forsetijudge.infrastructure.adapter.dto.rabbitmq.body

import java.io.Serializable

data class BroadcastEventFanoutQueueMessageBody(
    val room: String,
    val name: String,
    val data: Serializable? = null,
) : Serializable
