package com.forsetijudge.api.adapter.driving.socketio.listener

import com.corundumstudio.socketio.SocketIOClient
import com.forsetijudge.api.adapter.driven.socketio.SocketIOBroadcastEmitter
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.port.driven.broadcast.BroadcastEvent
import com.forsetijudge.infrastructure.adapter.driven.redis.BroadcastEventRedisStore
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import java.time.OffsetDateTime

class SocketIOSyncListenerTest :
    FunSpec({
        val broadcastEventRedisStore = mockk<BroadcastEventRedisStore>(relaxed = true)
        val socketIOBroadcastEmitter = mockk<SocketIOBroadcastEmitter>(relaxed = true)

        val sut =
            SocketIOSyncListener(
                broadcastEventRedisStore = broadcastEventRedisStore,
                socketIOBroadcastEmitter = socketIOBroadcastEmitter,
            )

        test("should send error event if client is not in the room") {
            val client = mockk<SocketIOClient>(relaxed = true)
            every { client.sessionId } returns IdGenerator.getUUID()
            every { client.allRooms } returns setOf("other_room")
            val payload =
                SocketIOSyncListenerPayload(
                    room = "test_room",
                    timestamp = OffsetDateTime.now(),
                )

            sut.onData(client, payload, mockk())

            verify {
                client.sendEvent("error", "Not in the room")
            }
        }

        test("should emit all events since timestamp and send sync_complete") {
            val client = mockk<SocketIOClient>(relaxed = true)
            every { client.sessionId } returns IdGenerator.getUUID()
            every { client.allRooms } returns setOf("test_room")
            val payload =
                SocketIOSyncListenerPayload(
                    room = "test_room",
                    timestamp = OffsetDateTime.now(),
                )
            val events =
                listOf(
                    BroadcastEvent(
                        room = "test_room",
                        name = "test_event",
                        data = "test_data",
                    ),
                )
            every { broadcastEventRedisStore.getAllSince("test_room", payload.timestamp) } returns events

            sut.onData(client, payload, mockk())

            verify {
                socketIOBroadcastEmitter.emitToClient(client, events[0])
                client.sendEvent("sync_complete")
            }
        }
    })
