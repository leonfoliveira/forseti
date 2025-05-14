package io.leonfoliveira.judge.adapter.bcrypt

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockkStatic
import org.springframework.security.crypto.bcrypt.BCrypt

class BCryptHashAdapterTest : FunSpec({
    val sut = BCryptHashAdapter()

    beforeEach {
        mockkStatic(BCrypt::class)
    }

    context("hash") {
        test("should hash a value") {
            val value = "value"
            val hash = "hash"

            every { BCrypt.hashpw(value, any()) } returns hash

            val result = sut.hash(value)

            result shouldBe hash
        }
    }

    context("verify") {
        test("should verify a value") {
            val value = "value"
            val hash = "hash"

            every { BCrypt.checkpw(value, hash) } returns true

            val result = sut.verify(value, hash)

            result shouldBe true
        }
    }
})
