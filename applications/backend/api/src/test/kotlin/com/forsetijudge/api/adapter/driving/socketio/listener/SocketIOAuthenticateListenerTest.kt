package com.forsetijudge.api.adapter.driving.socketio.listener

import com.corundumstudio.socketio.HandshakeData
import com.corundumstudio.socketio.SocketIOClient
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.driving.usecase.external.session.FindSessionByIdUseCase
import com.forsetijudge.core.port.dto.response.session.toResponseBodyDTO
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.netty.handler.codec.http.HttpHeaders

class SocketIOAuthenticateListenerTest :
    FunSpec({
        val findSessionByIdUseCase = mockk<FindSessionByIdUseCase>(relaxed = true)

        val sut = SocketIOAuthenticateListener(findSessionByIdUseCase)

        beforeEach {
            clearAllMocks()
            ExecutionContext.clear()
        }

        test("should not set session when there is no session id in handshake data") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val mockHandshakeData = mockk<HandshakeData>(relaxed = true)
            val mockHttpHeaders = mockk<HttpHeaders>(relaxed = true)
            every { mockHttpHeaders.get("Cookie") } returns ""
            every { mockHandshakeData.httpHeaders } returns mockHttpHeaders
            every { mockClient.handshakeData } returns mockHandshakeData

            sut.onData(mockClient, null, mockk())

            verify(exactly = 0) { mockClient.set("session", any()) }
        }

        test("should not set session when session id is blank") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val mockHandshakeData = mockk<HandshakeData>(relaxed = true)
            val mockHttpHeaders = mockk<HttpHeaders>(relaxed = true)
            every { mockHttpHeaders.get("Cookie") } returns "session_id="
            every { mockHandshakeData.httpHeaders } returns mockHttpHeaders
            every { mockClient.handshakeData } returns mockHandshakeData

            sut.onData(mockClient, null, mockk())

            verify(exactly = 0) { mockClient.set("session", any()) }
        }

        test("should not set session when session id is invalid UUID") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val mockHandshakeData = mockk<HandshakeData>(relaxed = true)
            val mockHttpHeaders = mockk<HttpHeaders>(relaxed = true)
            every { mockHttpHeaders.get("Cookie") } returns "session_id=invalid-uuid"
            every { mockHandshakeData.httpHeaders } returns mockHttpHeaders
            every { mockClient.handshakeData } returns mockHandshakeData

            sut.onData(mockClient, null, mockk())

            verify(exactly = 0) { findSessionByIdUseCase.execute(any()) }
            verify { mockClient.sendEvent("error", "Invalid session_id cookie format") }
            verify { mockClient.disconnect() }
        }

        test("should disconnect client when session id is invalid UUID") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val mockHandshakeData = mockk<HandshakeData>(relaxed = true)
            val mockHttpHeaders = mockk<HttpHeaders>(relaxed = true)
            every { mockHttpHeaders.get("Cookie") } returns "session_id=invalid-uuid"
            every { mockHandshakeData.httpHeaders } returns mockHttpHeaders
            every { mockClient.handshakeData } returns mockHandshakeData

            sut.onData(mockClient, null, mockk())

            verify { mockClient.sendEvent("error", "Invalid session_id cookie format") }
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

            sut.onData(mockClient, null, mockk())

            verify { findSessionByIdUseCase.execute(any()) }
            verify { mockClient.sendEvent("error", "Session not found") }
            verify { mockClient.disconnect() }
        }

        test("should set session when valid session id is provided") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val mockHandshakeData = mockk<HandshakeData>(relaxed = true)
            val mockHttpHeaders = mockk<HttpHeaders>(relaxed = true)
            every { mockHttpHeaders.get("X-Forwarded-For") } returns "0.0.0.0"
            every { mockHttpHeaders.get("Cookie") } returns "session_id=123e4567-e89b-12d3-a456-426614174000"
            every { mockHandshakeData.httpHeaders } returns mockHttpHeaders
            every { mockClient.handshakeData } returns mockHandshakeData
            val session = SessionMockBuilder.build()
            every { findSessionByIdUseCase.execute(any()) } returns session.toResponseBodyDTO()

            sut.onData(mockClient, null, mockk())

            verify { findSessionByIdUseCase.execute(any()) }
            verify { mockClient.set("session", session.toResponseBodyDTO()) }
            ExecutionContext.get().ip shouldBe "0.0.0.0"
        }
    })
