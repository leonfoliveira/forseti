package io.github.leonfoliveira.judge.api.service

import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.github.leonfoliveira.judge.common.service.authorization.AuthorizationService
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import java.time.OffsetDateTime

class AuthorizationCookieServiceTest :
    FunSpec({
        val authorizationService = mockk<AuthorizationService>()
        val secureCookies = true

        val sut = AuthorizationCookieService(authorizationService, secureCookies)

        val now = OffsetDateTime.now()

        beforeTest {
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
        }

        test("should return a cookie string") {
            val authorization = AuthorizationMockBuilder.build()
            every { authorizationService.encodeToken(authorization) } returns "mocked_token"

            val cookie = sut.buildCookie(authorization)

            cookie shouldContain "access_token=mocked_token"
            cookie shouldContain "HttpOnly"
            cookie shouldContain "SameSite=Lax"
            cookie shouldContain "Secure"
            cookie shouldContain "Path=/"
        }
    })
