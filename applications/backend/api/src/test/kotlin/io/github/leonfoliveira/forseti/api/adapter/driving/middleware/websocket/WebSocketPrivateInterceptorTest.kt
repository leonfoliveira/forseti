package io.github.leonfoliveira.forseti.api.adapter.driving.middleware.websocket

import io.github.leonfoliveira.forseti.common.application.domain.entity.Member
import io.github.leonfoliveira.forseti.common.application.domain.exception.ForbiddenException
import io.github.leonfoliveira.forseti.common.application.domain.model.RequestContext
import io.github.leonfoliveira.forseti.common.mock.entity.MemberMockBuilder
import io.github.leonfoliveira.forseti.common.mock.entity.SessionMockBuilder
import io.kotest.assertions.throwables.shouldThrow
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

class WebSocketPrivateInterceptorTest :
    FunSpec({
        val webSocketTopicConfigs = mockk<WebSocketTopicConfigs>(relaxed = true)

        val sut = WebSocketPrivateInterceptor(webSocketTopicConfigs)

        beforeEach {
            clearAllMocks()
            mockkStatic(MessageHeaderAccessor::class)
            RequestContext.clearContext()
        }

        test("should return message without modification if there is no accessor") {
            val message = mockk<Message<*>>()
            val channel = mockk<MessageChannel>()
            every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns null

            val result = sut.preSend(message, channel)

            result shouldBe message
        }

        test("should return message without modification if destination is null") {
            val message = mockk<Message<*>>()
            val channel = mockk<MessageChannel>()
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
            every { accessor.destination } returns null

            val result = sut.preSend(message, channel)

            result shouldBe message
        }

        test("should return message without modification if user is ROOT") {
            val message = mockk<Message<*>>()
            val channel = mockk<MessageChannel>()
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
            every { accessor.destination } returns "/topic/contests/1/submissions/full"
            RequestContext.getContext().session =
                SessionMockBuilder.build(
                    member =
                        MemberMockBuilder.build(
                            type = Member.Type.ROOT,
                        ),
                )

            val result = sut.preSend(message, channel)

            result shouldBe message
        }

        test("should return message without modification if no private configuration found for destination") {
            val message = mockk<Message<*>>()
            val channel = mockk<MessageChannel>()
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
            every { accessor.destination } returns "/topic/contests/1/submissions/invalid"

            val result = sut.preSend(message, channel)

            result shouldBe message
        }

        test("should throw ForbiddenException if user type is not allowed") {
            val message = mockk<Message<*>>()
            val channel = mockk<MessageChannel>()
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
            every { accessor.destination } returns "/topic/contests/1/submissions/full"
            RequestContext.getContext().session =
                SessionMockBuilder.build(
                    member =
                        MemberMockBuilder.build(
                            type = Member.Type.CONTESTANT,
                        ),
                )
            every { webSocketTopicConfigs.privateFilters } returns
                mapOf(
                    Regex("/topic/contests/[a-fA-F0-9-]+/submissions/full") to { destination: String ->
                        false
                    },
                )

            shouldThrow<ForbiddenException> {
                sut.preSend(message, channel)
            }
        }

        test("should return message without modification if user type is allowed") {
            val message = mockk<Message<*>>()
            val channel = mockk<MessageChannel>()
            val accessor = mockk<StompHeaderAccessor>(relaxed = true)
            every { MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java) } returns accessor
            every { accessor.destination } returns "/topic/contests/1/submissions/full"
            RequestContext.getContext().session =
                SessionMockBuilder.build(
                    member =
                        MemberMockBuilder.build(
                            type = Member.Type.JUDGE,
                        ),
                )

            val result = sut.preSend(message, channel)

            result shouldBe message
        }
    })
