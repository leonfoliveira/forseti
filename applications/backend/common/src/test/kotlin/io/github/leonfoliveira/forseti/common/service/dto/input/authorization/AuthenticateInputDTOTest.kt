package io.github.leonfoliveira.forseti.common.service.dto.input.authorization

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class AuthenticateInputDTOTest :
    FunSpec({
        context("toString") {
            test("should mask password in toString") {
                val input =
                    AuthenticateInputDTO(
                        login = "testLogin",
                        password = "testPassword",
                    )
                val expected = "AuthenticateInputDTO(login='testLogin', password='******')"

                input.toString() shouldBe expected
            }
        }
    })
