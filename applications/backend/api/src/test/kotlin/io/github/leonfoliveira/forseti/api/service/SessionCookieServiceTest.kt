package io.github.leonfoliveira.forseti.api.service

import io.github.leonfoliveira.forseti.common.mock.entity.SessionMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.mockk.every
import io.mockk.mockkStatic
import java.time.OffsetDateTime

class SessionCookieServiceTest :
    FunSpec({
        val cookieDomain = ".localhost"

        val now = OffsetDateTime.now()

        beforeTest {
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
        }

        context("secure = true") {
            val sut =
                SessionCookieService(
                    cookieDomain = cookieDomain,
                    cookieSecure = true,
                )

            test("should return a cookie string") {
                val session = SessionMockBuilder.build()

                val cookie = sut.buildCookie(session)

                cookie shouldContain "session_id=${session.id}"
                cookie shouldContain "Domain=.localhost"
                cookie shouldContain "HttpOnly"
                cookie shouldContain "Secure"
                cookie shouldContain "Path=/"
                cookie shouldContain "SameSite=None"
            }

            test("should return a clear cookie string") {
                val cookie = sut.buildClearCookie()

                cookie shouldContain "session_id="
                cookie shouldContain "Domain=.localhost"
                cookie shouldContain "HttpOnly"
                cookie shouldContain "Secure"
                cookie shouldContain "Path=/"
                cookie shouldContain "Max-Age=0"
                cookie shouldContain "SameSite=None"
            }
        }

        context("secure = false") {
            val sut =
                SessionCookieService(
                    cookieDomain = cookieDomain,
                    cookieSecure = false,
                )

            test("should return a cookie string") {
                val session = SessionMockBuilder.build()

                val cookie = sut.buildCookie(session)

                cookie shouldContain "session_id=${session.id}"
                cookie shouldNotContain "Domain=.localhost"
                cookie shouldContain "HttpOnly"
                cookie shouldNotContain "Secure"
                cookie shouldContain "Path=/"
                cookie shouldContain "SameSite=Lax"
            }

            test("should return a clear cookie string") {
                val cookie = sut.buildClearCookie()

                cookie shouldContain "session_id="
                cookie shouldNotContain "Domain=.localhost"
                cookie shouldContain "HttpOnly"
                cookie shouldNotContain "Secure"
                cookie shouldContain "Path=/"
                cookie shouldContain "Max-Age=0"
                cookie shouldContain "SameSite=Lax"
            }
        }
    })
