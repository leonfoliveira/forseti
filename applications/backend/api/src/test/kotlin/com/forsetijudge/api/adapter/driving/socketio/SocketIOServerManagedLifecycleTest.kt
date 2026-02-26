package com.forsetijudge.api.adapter.driving.socketio

import com.corundumstudio.socketio.SocketIOServer
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.mockk
import io.mockk.verify

class SocketIOServerManagedLifecycleTest :
    FunSpec({
        val server = mockk<SocketIOServer>(relaxed = true)

        val sut = SocketIOServerManagedLifecycle(server)

        test("should start server on start") {
            sut.start()

            verify { server.start() }
        }

        test("should stop server on stop") {
            sut.stop()

            verify { server.stop() }
        }

        test("handle isRunning correctly") {
            sut.isRunning() shouldBe false

            sut.start()
            sut.isRunning() shouldBe true

            sut.stop()
            sut.isRunning() shouldBe false
        }
    })
