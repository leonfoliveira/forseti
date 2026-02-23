package com.forsetijudge.core.port.driven.producer.payload

import java.io.Serializable

data class WebSocketFanoutPayload(
    val destination: String,
    val body: Serializable? = null,
) : Serializable
