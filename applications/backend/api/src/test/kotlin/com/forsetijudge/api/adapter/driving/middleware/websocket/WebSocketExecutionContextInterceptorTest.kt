package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContext
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.MessageHeaderAccessor

class WebSocketExecutionContextInterceptorTest :
    FunSpec({
        val sut = WebSocketExecutionContextInterceptor()

        beforeEach {
            clearAllMocks()
            mockkStatic(MessageHeaderAccessor::class)
            ExecutionContext.clear()
        }

        test("should set empty context when no accessor is found") {
            val message = mockk<Message<*>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns null

            sut.preSend(message, channel)

            val context = ExecutionContext.get()
            context.ip shouldBe null
        }

        test("should set empty context when no session attributes are found") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns accessor
            every { accessor.sessionAttributes } returns null

            sut.preSend(message, channel)

            val context = ExecutionContext.get()
            context.ip shouldBe null
        }

        test("should set empty context when no context is found in session attributes") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns accessor
            every { accessor.sessionAttributes } returns mapOf()

            sut.preSend(message, channel)

            val context = ExecutionContext.get()
            context.ip shouldBe null
        }

        test("should set empty context when context found in session attributes is not a valid ExecutionContext") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns accessor
            every { accessor.sessionAttributes } returns mapOf("handshake_context" to "invalid")

            sut.preSend(message, channel)

            val context = ExecutionContext.get()
            context.ip shouldBe null
        }

        test("should set empty context when acessor does not have destination header") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns accessor
            val existingContext =
                ExecutionContext(session = SessionMockBuilder.build(), ip = "127.0.0.1", traceId = "traceId")
            every { accessor.sessionAttributes } returns mapOf("handshake_context" to existingContext)
            every { accessor.destination } returns null

            sut.preSend(message, channel)

            val context = ExecutionContext.get()
            context.ip shouldBe null
        }

        test("should set context when valid context is found in session attributes") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns accessor
            val existingContext =
                ExecutionContext(session = SessionMockBuilder.build(), ip = "127.0.0.1", traceId = "traceId")
            every { accessor.sessionAttributes } returns mapOf("handshake_context" to existingContext)
            val contestId = IdGenerator.getUUID()
            every { accessor.destination } returns "/topic/contests/$contestId/announcements"

            sut.preSend(message, channel)

            val context = ExecutionContext.get()
            context.ip shouldBe existingContext.ip
            context.contestId shouldBe contestId
        }

        test("should not set contestId in context when destination does not contain valid contestId") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns accessor
            val existingContext =
                ExecutionContext(session = SessionMockBuilder.build(), ip = "127.0.0.1", traceId = "traceId")
            every { accessor.sessionAttributes } returns mapOf("handshake_context" to existingContext)
            every { accessor.destination } returns "/topic/contests/invalid-contest-id/announcements"

            sut.preSend(message, channel)

            val context = ExecutionContext.get()
            context.ip shouldBe existingContext.ip
            context.contestId shouldBe null
        }
    })
