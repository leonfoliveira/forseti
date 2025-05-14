package io.leonfoliveira.judge.adapter.oauth

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.leonfoliveira.judge.core.domain.entity.Member
import io.leonfoliveira.judge.core.domain.model.Authorization

class OAuthJwtAdapterTest : FunSpec({
    val secret = "secret"
    val expiration = 1000L

    val sut = OAuthJwtAdapter(secret, expiration)

    context("generateToken") {
        test("should generate a token") {
            val authorization =
                Authorization(
                    id = 1,
                    name = "name",
                    login = "login",
                    type = Member.Type.CONTESTANT,
                )

            val token = sut.generateToken(authorization)

            token.shouldNotBeNull()
        }
    }

    context("decodeToken") {
        test("should decode a token") {
            val authorization =
                Authorization(
                    id = 1,
                    name = "name",
                    login = "login",
                    type = Member.Type.CONTESTANT,
                )
            val token = sut.generateToken(authorization)

            val decodedAuthorization = sut.decodeToken(token)

            decodedAuthorization shouldBe authorization
        }
    }
})
