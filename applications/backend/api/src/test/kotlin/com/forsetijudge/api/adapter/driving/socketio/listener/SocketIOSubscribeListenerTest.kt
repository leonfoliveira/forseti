package com.forsetijudge.api.adapter.driving.socketio.listener

import com.corundumstudio.socketio.SocketIOClient
import com.github.dockerjava.api.exception.UnauthorizedException
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class SocketIOSubscribeListenerTest :
    FunSpec({
        val socketIOTopicPrivateConfigs = mockk<SocketIOTopicPrivateConfigs>()

        val sut = SocketIOSubscribeListener(socketIOTopicPrivateConfigs)

        beforeEach {
            every { socketIOTopicPrivateConfigs.privateFilters } returns
                mapOf(
                    Regex("/success") to { true },
                    Regex("/error") to { throw UnauthorizedException("") },
                )
        }

        test("should send error message when no private filter matches") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)

            sut.onData(mockClient, "/unknown", mockk())

            verify { mockClient.sendEvent("error", "Topic not found: /unknown") }
        }

        test("should join room when private filter authorizes") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)

            sut.onData(mockClient, "/success", mockk())

            verify { mockClient.joinRoom("/success") }
        }

        test("should send error message when private filter throws exception") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)

            sut.onData(mockClient, "/error", mockk())

            verify { mockClient.sendEvent("error", "Unauthorized to subscribe to topic: /error") }
        }
    })
