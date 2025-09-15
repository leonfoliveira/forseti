package io.github.leonfoliveira.judge.api.service

import io.github.leonfoliveira.judge.common.mock.entity.SessionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.string.shouldContain
import io.mockk.every
import io.mockk.mockkStatic
import java.time.OffsetDateTime

class SessionCookieServiceTest :
    FunSpec({
        val secureCookies = true

        val sut = SessionCookieService(secureCookies)

        val now = OffsetDateTime.now()

        beforeTest {
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
        }

        test("should return a cookie string") {
            val session = SessionMockBuilder.build()

            val cookie = sut.buildCookie(session)

            cookie shouldContain "session_id=${session.id}"
            cookie shouldContain "HttpOnly"
            cookie shouldContain "SameSite=Lax"
            cookie shouldContain "Secure"
            cookie shouldContain "Path=/"
        }
    })
