package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContext
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.mockk
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.web.socket.WebSocketHandler

class WebSocketContextHandshakeInterceptorTest :
    FunSpec({
        val sut = WebSocketHandshakeExecutionContextInterceptor()

        test("beforeHandshake should store context in attributes") {
            val mockRequest = mockk<ServerHttpRequest>(relaxed = true)
            val mockResponse = mockk<ServerHttpResponse>(relaxed = true)
            val mockWsHandler = mockk<WebSocketHandler>(relaxed = true)
            val attributes = mutableMapOf<String, Any>()
            ExecutionContext.start()
            ExecutionContext.authenticate(SessionMockBuilder.build(contest = null))

            val result = sut.beforeHandshake(mockRequest, mockResponse, mockWsHandler, attributes)

            result shouldBe true
            attributes.containsKey("handshake_context") shouldBe true
            attributes["handshake_context"] shouldBe ExecutionContext.get()
        }
    })
