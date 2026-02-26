package com.forsetijudge.api.adapter.driving.socketio.listener

import com.corundumstudio.socketio.SocketIOClient
import io.kotest.core.spec.style.FunSpec
import io.mockk.mockk
import io.mockk.verify

class SocketIOPingListenerTest :
    FunSpec({
        val sut = SocketIOPingListener()

        test("should respond with 'pong' when 'ping' is received") {
            val client = mockk<SocketIOClient>(relaxed = true)

            sut.onData(client, "ping", mockk())

            verify {
                client.sendEvent("pong")
            }
        }
    })
