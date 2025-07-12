package io.github.leonfoliveira.judge.common.adapter.aws

import io.github.leonfoliveira.judge.common.adapter.aws.message.SqsMessage
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.verify
import org.slf4j.MDC

class SqsConsumerTest : FunSpec({
    val handlePayloadMock: (String) -> Unit = mockk(relaxed = true)

    class Dummy : SqsConsumer<String>() {
        override fun handlePayload(payload: String) {
            handlePayloadMock(payload)
        }
    }

    val sut = Dummy()

    beforeEach {
        mockkStatic(MDC::class)
    }

    test("should create a new traceId if not present in the message") {
        val message = SqsMessage(payload = "test payload", traceId = null)

        sut.receiveMessage(message)

        verify { MDC.put("traceId", any<String>()) }
        verify { MDC.clear() }
    }

    test("should use the traceId from the message if present") {
        val traceId = "existing-trace-id"
        val message = SqsMessage(payload = "test payload", traceId = traceId)
        sut.receiveMessage(message)

        verify { MDC.put("traceId", traceId) }
        verify { MDC.clear() }
    }

    test("should call handlePayload with the message payload") {
        val message = SqsMessage(payload = "test payload", traceId = null)

        sut.receiveMessage(message)

        verify { handlePayloadMock("test payload") }
    }

    test("should throw an exception if handlePayload throws one") {
        val message = SqsMessage(payload = "test payload", traceId = null)
        val exception = RuntimeException("Test exception")
        every { handlePayloadMock("test payload") } throws exception

        shouldThrow<RuntimeException> {
            sut.receiveMessage(message)
        }.message shouldBe "Test exception"

        verify { MDC.clear() }
    }
})
