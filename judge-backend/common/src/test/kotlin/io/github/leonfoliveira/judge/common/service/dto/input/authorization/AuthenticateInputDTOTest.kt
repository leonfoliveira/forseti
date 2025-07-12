package io.github.leonfoliveira.judge.common.service.dto.input.authorization

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class AuthenticateInputDTOTest : FunSpec({
    context("toString") {
        test("should mask password in toString") {
            val input =
                AuthenticateInputDTO(
                    login = "testUser",
                    password = "testPassword",
                )
            val expected = "AuthenticateInputDTO(login='testUser', password='******')"

            input.toString() shouldBe expected
        }
    }
})
