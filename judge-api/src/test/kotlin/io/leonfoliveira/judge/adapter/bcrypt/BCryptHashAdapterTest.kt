package io.leonfoliveira.judge.adapter.bcrypt

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.mockk.verify
import org.springframework.security.crypto.bcrypt.BCrypt

class BCryptHashAdapterTest : FunSpec({
    val sut = BCryptHashAdapter()

    context("hash") {
        test("should hash a value") {
            val result = sut.hash("value")

            result.shouldNotBeNull()
        }
    }

    context("verify") {
        test("should verify a value") {
            val value = "value"
            val hash = BCrypt.hashpw(value, BCrypt.gensalt())

            val correctResult = sut.verify(value, hash)
            val incorrectResult = sut.verify("wrongValue", hash)

            correctResult shouldBe true
            incorrectResult shouldBe false
        }
    }
})
