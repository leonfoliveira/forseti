package com.forsetijudge.api.adapter.driving.middleware.websocket

import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.ContestMockBuilder
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

class WebSocketAuthenticationInterceptorTest :
    FunSpec({
        val sut = WebSocketAuthenticationInterceptor()

        beforeEach {
            clearAllMocks()
            mockkStatic(MessageHeaderAccessor::class)
            ExecutionContext.start()
        }

        test("should not set session in context when no accessor is found") {
            val message = mockk<Message<*>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns null

            sut.preSend(message, channel)

            ExecutionContext.get().session shouldBe null
        }

        test("should not set session in context when no session attributes are found") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns accessor
            every { accessor.sessionAttributes } returns null

            sut.preSend(message, channel)

            ExecutionContext.get().session shouldBe null
        }

        test("should not set session in context when no context is found in session attributes") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns accessor
            every { accessor.sessionAttributes } returns mapOf()

            sut.preSend(message, channel)

            ExecutionContext.get().session shouldBe null
        }

        test("should not set session in context when context found in session attributes is not valid") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns accessor
            every { accessor.sessionAttributes } returns mapOf("handshake_context" to "invalid_context")

            sut.preSend(message, channel)

            ExecutionContext.get().session shouldBe null
        }

        test("should not set session in context when context found in session attributes does not have a session") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            val handShakeContext = ExecutionContext(traceId = IdGenerator.getTraceId(), session = null)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns accessor
            every { accessor.sessionAttributes } returns mapOf("handshake_context" to handShakeContext)

            sut.preSend(message, channel)

            ExecutionContext.get().session shouldBe null
        }

        test("should not set session in context when session found in context does not belong to the current contest") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            val session = SessionMockBuilder.build()
            val handShakeContext = ExecutionContext(traceId = IdGenerator.getTraceId(), session = session)
            every { MessageHeaderAccessor.getAccessor(any<Message<*>>(), StompHeaderAccessor::class.java) } returns accessor
            every { accessor.sessionAttributes } returns mapOf("handshake_context" to handShakeContext)
            every { accessor.destination } returns "/topic/contest/${IdGenerator.getUUID()}/updates"

            sut.preSend(message, channel)

            ExecutionContext.get().session shouldBe null
        }

        test("should set session in context when not there is no contestId in context") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            val contest = ContestMockBuilder.build()
            val session = SessionMockBuilder.build(contest = contest)
            val handShakeContext = ExecutionContext(traceId = IdGenerator.getTraceId(), session = session)
            every {
                MessageHeaderAccessor.getAccessor(
                    any<Message<*>>(),
                    StompHeaderAccessor::class.java,
                )
            } returns accessor
            every { accessor.sessionAttributes } returns mapOf("handshake_context" to handShakeContext)

            sut.preSend(message, channel)

            ExecutionContext.get().session shouldBe session
        }

        test("should set session in context when valid context is found in session attributes") {
            val message = mockk<Message<Any>>(relaxed = true)
            val channel = mockk<MessageChannel>(relaxed = true)
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            val contest = ContestMockBuilder.build()
            val session = SessionMockBuilder.build(contest = contest)
            val handShakeContext = ExecutionContext(traceId = IdGenerator.getTraceId(), session = session)
            every {
                MessageHeaderAccessor.getAccessor(
                    any<Message<*>>(),
                    StompHeaderAccessor::class.java,
                )
            } returns accessor
            every { accessor.sessionAttributes } returns mapOf("handshake_context" to handShakeContext)
            ExecutionContext.get().contestId = contest.id

            sut.preSend(message, channel)

            ExecutionContext.get().session shouldBe session
        }
    })
