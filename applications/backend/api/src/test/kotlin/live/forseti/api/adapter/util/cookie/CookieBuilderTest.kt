package live.forseti.api.adapter.util.cookie

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.mockk.every
import io.mockk.mockkStatic
import java.time.OffsetDateTime

class CookieBuilderTest :
    FunSpec({
        val cookieDomain = ".localhost"

        val now = OffsetDateTime.now()

        beforeTest {
            mockkStatic(OffsetDateTime::class)
            every { OffsetDateTime.now() } returns now
        }

        val cookieKey = "session_id"
        val cookieValue = "123"

        context("secure = true") {
            val sut =
                CookieBuilder(
                    cookieDomain = cookieDomain,
                    cookieSecure = true,
                )

            test("should return a cookie string") {
                val cookie = sut.from(cookieKey, cookieValue).build().toString()

                cookie shouldContain "$cookieKey=$cookieValue"
                cookie shouldContain "Domain=.localhost"
                cookie shouldContain "HttpOnly"
                cookie shouldContain "Secure"
                cookie shouldContain "Path=/"
                cookie shouldContain "SameSite=None"
            }

            test("should return a clear cookie string") {
                val cookie = sut.clean(cookieKey).build().toString()

                cookie shouldContain "$cookieKey="
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
                CookieBuilder(
                    cookieDomain = cookieDomain,
                    cookieSecure = false,
                )

            test("should return a cookie string") {
                val cookie = sut.from(cookieKey, cookieValue).build().toString()

                cookie shouldContain "$cookieKey=$cookieValue"
                cookie shouldNotContain "Domain=.localhost"
                cookie shouldContain "HttpOnly"
                cookie shouldNotContain "Secure"
                cookie shouldContain "Path=/"
                cookie shouldContain "SameSite=Lax"
            }

            test("should return a clear cookie string") {
                val cookie = sut.clean(cookieKey).build().toString()

                cookie shouldContain "$cookieKey="
                cookie shouldNotContain "Domain=.localhost"
                cookie shouldContain "HttpOnly"
                cookie shouldNotContain "Secure"
                cookie shouldContain "Path=/"
                cookie shouldContain "Max-Age=0"
                cookie shouldContain "SameSite=Lax"
            }
        }
    })
