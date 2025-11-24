package live.forseti.api.adapter.util.cookie

import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.mockk.every
import io.mockk.mockk
import live.forseti.core.domain.entity.SessionMockBuilder
import org.springframework.http.ResponseCookie

class CsrfCookieBuilderTest :
    FunSpec({
        val cookieBuilder = mockk<CookieBuilder>(relaxed = true)

        val sut = CsrfCookieBuilder(cookieBuilder)

        beforeEach {
            every { cookieBuilder.from(any(), any()) } answers {
                val name = this.invocation.args[0] as String
                val value = this.invocation.args[1] as String
                ResponseCookie.from(name, value)
            }

            every { cookieBuilder.clean(any()) } answers {
                val name = this.invocation.args[0] as String
                ResponseCookie.from(name, "")
            }
        }

        context("buildCookie") {
            test("should build CSRF token cookie") {
                val session = SessionMockBuilder.build()

                val cookie = sut.buildCookie(session)

                cookie shouldContain "csrf_token=${session.csrfToken}"
                cookie shouldNotContain "HttpOnly"
            }
        }

        context("buildCleanCookie") {
            test("should build clear CSRF token cookie") {
                val cookie = sut.buildCleanCookie()

                cookie shouldContain "csrf_token="
                cookie shouldNotContain "HttpOnly"
            }
        }
    })
