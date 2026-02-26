package com.forsetijudge.api.adapter.driving.socketio.listener

import com.corundumstudio.socketio.AckRequest
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.listener.DataListener
import org.springframework.stereotype.Component

@Component
class SocketIOPingListener : DataListener<String> {
    /**
     * Responds with a "pong" event when a "ping" event is received.
     */
    override fun onData(
        client: SocketIOClient,
        data: String,
        ackSender: AckRequest,
    ) {
        client.sendEvent("pong")
    }
}
