package live.forseti.core.application.service.dto.input.authorization

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import live.forseti.core.port.dto.input.authorization.ContestAuthenticateInputDTO

class ContestAuthenticateInputDTOTest :
    FunSpec({
        context("toString") {
            test("should mask password in toString") {
                val input =
                    ContestAuthenticateInputDTO(
                        login = "testUser",
                        password = "testPassword",
                    )
                val expected = "ContestAuthenticateInputDTO(login='testUser', password='******')"

                input.toString() shouldBe expected
            }
        }
    })
