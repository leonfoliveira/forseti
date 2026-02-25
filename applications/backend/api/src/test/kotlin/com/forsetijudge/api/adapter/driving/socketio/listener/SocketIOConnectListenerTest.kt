package com.forsetijudge.api.adapter.driving.socketio.listener

import com.corundumstudio.socketio.HandshakeData
import com.corundumstudio.socketio.SocketIOClient
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import io.kotest.core.spec.style.FunSpec
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.netty.handler.codec.http.HttpHeaders

class SocketIOConnectListenerTest :
    FunSpec({
        val findSessionByIdUseCase = mockk<FindSessionByIdUseCase>(relaxed = true)

        val sut = SocketIOConnectListener(findSessionByIdUseCase)

        test("should not set session when there is no session id in handshake data") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val mockHandshakeData = mockk<HandshakeData>(relaxed = true)
            val mockHttpHeaders = mockk<HttpHeaders>(relaxed = true)
            every { mockHttpHeaders.get("Cookie") } returns ""
            every { mockHandshakeData.httpHeaders } returns mockHttpHeaders
            every { mockClient.handshakeData } returns mockHandshakeData

            sut.onConnect(mockClient)

            verify(exactly = 0) { mockClient.set("session", any()) }
        }

        test("should not set session when session id is blank") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val mockHandshakeData = mockk<HandshakeData>(relaxed = true)
            val mockHttpHeaders = mockk<HttpHeaders>(relaxed = true)
            every { mockHttpHeaders.get("Cookie") } returns "session_id="
            every { mockHandshakeData.httpHeaders } returns mockHttpHeaders
            every { mockClient.handshakeData } returns mockHandshakeData

            sut.onConnect(mockClient)

            verify(exactly = 0) { mockClient.set("session", any()) }
        }

        test("should not set session when session id is invalid UUID") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val mockHandshakeData = mockk<HandshakeData>(relaxed = true)
            val mockHttpHeaders = mockk<HttpHeaders>(relaxed = true)
            every { mockHttpHeaders.get("Cookie") } returns "session_id=invalid-uuid"
            every { mockHandshakeData.httpHeaders } returns mockHttpHeaders
            every { mockClient.handshakeData } returns mockHandshakeData

            sut.onConnect(mockClient)

            verify(exactly = 0) { findSessionByIdUseCase.execute(any()) }
            verify { mockClient.sendEvent("error", "Invalid session_id cookie format.") }
            verify { mockClient.disconnect() }
        }

        test("should disconnect client when session id is invalid UUID") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val mockHandshakeData = mockk<HandshakeData>(relaxed = true)
            val mockHttpHeaders = mockk<HttpHeaders>(relaxed = true)
            every { mockHttpHeaders.get("Cookie") } returns "session_id=invalid-uuid"
            every { mockHandshakeData.httpHeaders } returns mockHttpHeaders
            every { mockClient.handshakeData } returns mockHandshakeData

            sut.onConnect(mockClient)

            verify { mockClient.sendEvent("error", "Invalid session_id cookie format.") }
            verify { mockClient.disconnect() }
        }

        test("should disconnect client when session cannot be loaded") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val mockHandshakeData = mockk<HandshakeData>(relaxed = true)
            val mockHttpHeaders = mockk<HttpHeaders>(relaxed = true)
            every { mockHttpHeaders.get("Cookie") } returns "session_id=123e4567-e89b-12d3-a456-426614174000"
            every { mockHandshakeData.httpHeaders } returns mockHttpHeaders
            every { mockClient.handshakeData } returns mockHandshakeData
            every { findSessionByIdUseCase.execute(any()) } throws UnauthorizedException("Session not found")

            sut.onConnect(mockClient)

            verify { findSessionByIdUseCase.execute(any()) }
            verify { mockClient.sendEvent("error", "Session not found") }
            verify { mockClient.disconnect() }
        }

        test("should set session when valid session id is provided") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val mockHandshakeData = mockk<HandshakeData>(relaxed = true)
            val mockHttpHeaders = mockk<HttpHeaders>(relaxed = true)
            every { mockHttpHeaders.get("Cookie") } returns "session_id=123e4567-e89b-12d3-a456-426614174000"
            every { mockHandshakeData.httpHeaders } returns mockHttpHeaders
            every { mockClient.handshakeData } returns mockHandshakeData
            val session = SessionMockBuilder.build()
            every { findSessionByIdUseCase.execute(any()) } returns session

            sut.onConnect(mockClient)

            verify { findSessionByIdUseCase.execute(any()) }
            verify { mockClient.set("session", session) }
        }
    })
