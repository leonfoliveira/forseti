package live.forseti.core.application.service.dto.input.authorization

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import live.forseti.core.port.dto.input.authorization.AuthenticateInputDTO

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
