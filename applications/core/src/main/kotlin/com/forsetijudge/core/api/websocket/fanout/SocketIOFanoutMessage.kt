package com.forsetijudge.core.api.websocket.fanout

data class SocketIOFanoutMessage(
    val room: String,
    val eventName: String,
    val data: Any,
)
