package io.github.leonfoliveira.judge.common.service.dto.input.authorization

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe

class RootAuthenticateInputDTOTest :
    FunSpec({
        context("toString") {
            test("should mask password in toString") {
                val input =
                    RootAuthenticateInputDTO(
                        password = "testPassword",
                    )
                val expected = "RootAuthenticateInputDTO(password='******')"

                input.toString() shouldBe expected
            }
        }
    })
