package com.forsetijudge.api.adapter.driven.socketio

import com.corundumstudio.socketio.BroadcastOperations
import com.corundumstudio.socketio.SocketIOClient
import com.corundumstudio.socketio.SocketIOServer
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.io.Serializable

class SocketIOBroadcastEmitterTest :
    FunSpec({
        val socketIOServer = mockk<SocketIOServer>()

        val sut = SocketIOBroadcastEmitter(socketIOServer)

        val broadcastOperations = mockk<BroadcastOperations>(relaxed = true)

        beforeEach {
            clearAllMocks()
            every { socketIOServer.getRoomOperations(any()) } returns broadcastOperations
        }

        test("should emit event to the correct room") {
            val event =
                BroadcastEvent(
                    room = "/topic/any",
                    name = "ANY",
                    data = mapOf("foo" to "bar") as Serializable,
                )

            sut.emit(event)

            verify {
                socketIOServer.getRoomOperations(event.room)
            }
            verify {
                broadcastOperations.sendEvent(
                    event.name,
                    event.data,
                )
            }
        }

        test("should emit event to the correct client") {
            val client = mockk<SocketIOClient>(relaxed = true)
            val event =
                BroadcastEvent(
                    room = "/topic/any",
                    name = "ANY",
                    data = mapOf("foo" to "bar") as Serializable,
                )

            sut.emitToClient(client, event)

            verify {
                client.sendEvent(
                    event.name,
                    event.data,
                )
            }
        }
    })
