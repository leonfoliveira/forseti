package io.leonfoliveira.judge.api.security.websocket

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.api.util.AuthorizationExtractor
import io.mockk.mockk
import io.mockk.verify
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompCommand
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.MessageBuilder

class WebSocketJwtAuthFilterTest : FunSpec({
    val authorizationExtractor = mockk<AuthorizationExtractor>(relaxed = true)
    val sut = WebSocketJwtAuthFilter(authorizationExtractor)

    val messageChannel = mockk<MessageChannel>(relaxed = true)

    test("preSend should return message unchanged if accessor is null") {
        val message = MessageBuilder.withPayload("test").build()

        val result = sut.preSend(message, messageChannel)

        result shouldBe message
        verify(exactly = 0) { authorizationExtractor.extractMember(any()) }
    }

    test("preSend should return message unchanged") {
        val accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE)
        val authHeader = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        accessor.setNativeHeader("Authorization", authHeader)
        val message = MessageBuilder.createMessage(ByteArray(0), accessor.messageHeaders)

        val result = sut.preSend(message, messageChannel)

        result shouldBe message
        verify { authorizationExtractor.extractMember(authHeader) }
    }
})
