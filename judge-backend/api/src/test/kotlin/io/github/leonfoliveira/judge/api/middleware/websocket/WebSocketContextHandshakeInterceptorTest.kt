package io.github.leonfoliveira.judge.api.middleware.websocket

import io.github.leonfoliveira.judge.common.domain.model.RequestContext
import io.github.leonfoliveira.judge.common.mock.entity.SessionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.mockk
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.web.socket.WebSocketHandler

class WebSocketContextHandshakeInterceptorTest :
    FunSpec({
        val sut = WebSocketContextHandshakeInterceptor()

        test("beforeHandshake should store context in attributes") {
            val mockRequest = mockk<ServerHttpRequest>()
            val mockResponse = mockk<ServerHttpResponse>()
            val mockWsHandler = mockk<WebSocketHandler>()
            val attributes = mutableMapOf<String, Any>()
            val context = RequestContext(session = SessionMockBuilder.build(), ip = "127.0.0.1", traceId = "traceId")
            RequestContext.setContext(context)

            val result = sut.beforeHandshake(mockRequest, mockResponse, mockWsHandler, attributes)

            result shouldBe true
            attributes.containsKey("context") shouldBe true
            attributes["context"] shouldBe context
        }
    })
