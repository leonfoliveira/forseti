package io.github.leonfoliveira.judge.common.adapter.bcrypt

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe

class BCryptHashAdapterTest : FunSpec({
    val sut = BCryptHashAdapter()

    test("should hash a value") {
        val value = "password"
        val hash = sut.hash(value)

        hash shouldNotBe value
    }

    test("should verify a value against a hash") {
        val value = "password"
        val hash = sut.hash(value)

        sut.verify(value, hash) shouldBe true
        sut.verify("wrongPassword", hash) shouldBe false
    }
})
