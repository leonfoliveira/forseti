package io.github.leonfoliveira.judge.api.security.websocket

import io.github.leonfoliveira.judge.api.util.AuthorizationExtractor
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.verify
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.MessageHeaderAccessor

class WebSocketJwtAuthFilterTest : FunSpec({
    val authorizationExtractor = mockk<AuthorizationExtractor>(relaxed = true)

    val sut = WebSocketJwtAuthFilter(authorizationExtractor)

    beforeEach {
        clearAllMocks()
        mockkStatic(MessageHeaderAccessor::class)
    }

    test("should return message without modification if there is no accessor") {
        val message = mockk<Message<*>>()
        val channel = mockk<MessageChannel>()
        every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns null

        val result = sut.preSend(message, channel)

        result shouldBe message
        verify(exactly = 0) { authorizationExtractor.extractMember(any()) }
    }

    test("should extract member from cookie") {
        val message = mockk<Message<*>>()
        val channel = mockk<MessageChannel>()
        val accessor = mockk<StompHeaderAccessor>(relaxed = true)
        val accessToken = "token"
        every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
        every { accessor.getNativeHeader("Cookie") } returns listOf("access_token=$accessToken")

        val result = sut.preSend(message, channel)

        result shouldBe message
        verify { authorizationExtractor.extractMember(accessToken) }
    }

    test("should handle empty cookie header") {
        val message = mockk<Message<*>>()
        val channel = mockk<MessageChannel>()
        val accessor = mockk<StompHeaderAccessor>(relaxed = true)
        every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
        every { accessor.getNativeHeader("Cookie") } returns emptyList()

        val result = sut.preSend(message, channel)

        result shouldBe message
        verify { authorizationExtractor.extractMember(null) }
    }
})
