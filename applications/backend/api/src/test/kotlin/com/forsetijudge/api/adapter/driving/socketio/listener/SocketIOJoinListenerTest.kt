package com.forsetijudge.api.adapter.driving.socketio.listener

import com.corundumstudio.socketio.SocketIOClient
import com.forsetijudge.core.application.util.IdGenerator
import com.forsetijudge.core.domain.entity.Session
import com.forsetijudge.core.domain.entity.SessionMockBuilder
import com.forsetijudge.core.domain.model.ExecutionContext
import com.github.dockerjava.api.exception.UnauthorizedException
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class SocketIOJoinListenerTest :
    FunSpec({
        val socketIORoomAuthorizers = mockk<SocketIORoomAuthorizers>()

        val sut = SocketIOJoinListener(socketIORoomAuthorizers)

        beforeEach {
            every { socketIORoomAuthorizers.authorizers } returns
                mapOf(
                    Regex("/success") to { true },
                    Regex("/contests/.*") to { true },
                    Regex("/error") to { throw UnauthorizedException("") },
                )
        }

        test("should send error message when no private filter matches") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            every { mockClient.get<Session?>("session") } returns null

            sut.onData(mockClient, "/unknown", mockk())

            verify { mockClient.sendEvent("error", "Room not found: /unknown") }
        }

        test("should join room when private filter authorizes without contestId") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            every { mockClient.get<Session?>("session") } returns null

            sut.onData(mockClient, "/success", mockk())

            verify { mockClient.joinRoom("/success") }
        }

        test("should join room when private filter authorizes with contestId") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val session = SessionMockBuilder.build()
            every { mockClient.handshakeData.httpHeaders.get("X-Forwarded-For") } returns "0.0.0.0"
            every { mockClient.get<Session?>("session") } returns session

            sut.onData(mockClient, "/contests/${session.member.contest!!.id}", mockk())

            verify { mockClient.joinRoom("/contests/${session.member.contest!!.id}") }
            ExecutionContext.get().ip shouldBe "0.0.0.0"
            ExecutionContext.get().contestId shouldBe session.member.contest!!.id
            ExecutionContext.get().session shouldBe session
        }

        test("should join room when private filter authorizes with mismatching contestId") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            val session = SessionMockBuilder.build()
            val otherContestId = IdGenerator.getUUID()
            every { mockClient.handshakeData.httpHeaders.get("X-Forwarded-For") } returns "0.0.0.0"
            every { mockClient.get<Session?>("session") } returns session

            sut.onData(mockClient, "/contests/$otherContestId", mockk())

            verify { mockClient.joinRoom("/contests/$otherContestId") }
            ExecutionContext.get().ip shouldBe "0.0.0.0"
            ExecutionContext.get().contestId shouldBe otherContestId
            ExecutionContext.get().session shouldBe null
        }

        test("should send error message when private filter throws exception") {
            val mockClient = mockk<SocketIOClient>(relaxed = true)
            every { mockClient.get<Session?>("session") } returns null

            sut.onData(mockClient, "/error", mockk())

            verify { mockClient.sendEvent("error", "Unauthorized to subscribe to room: /error") }
        }
    })
