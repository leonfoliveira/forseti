package live.forseti.infrastructure.adapter.driven.bcrypt

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe

class BCryptHasherTest :
    FunSpec({
        val sut = BCryptHasher()

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
