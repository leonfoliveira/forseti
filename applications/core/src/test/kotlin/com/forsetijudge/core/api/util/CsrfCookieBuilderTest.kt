package com.forsetijudge.core.api.util

import com.forsetijudge.core.factory.MockModelFactory
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.ResponseCookie
import java.time.OffsetDateTime

class CsrfCookieBuilderTest {
    @Test
    fun `builds readable csrf cookie using session token and expiry`() {
        val session = MockModelFactory.session(expiresAt = OffsetDateTime.now().plusSeconds(600))
        val responseCookieBuilder = mock<ResponseCookie.ResponseCookieBuilder>()
        val cookieBuilder = mock<CookieBuilder>()
        whenever(cookieBuilder.from(CsrfCookieBuilder.CSRF_COOKIE_NAME, session.csrfToken.toString()))
            .thenReturn(responseCookieBuilder)
        whenever(responseCookieBuilder.maxAge(any<java.time.Duration>())).thenReturn(responseCookieBuilder)
        whenever(responseCookieBuilder.httpOnly(false)).thenReturn(responseCookieBuilder)
        whenever(responseCookieBuilder.build())
            .thenReturn(ResponseCookie.from("csrf_token", session.csrfToken.toString()).httpOnly(false).build())

        val result = CsrfCookieBuilder(cookieBuilder).buildCookie(session)

        assertTrue(result.contains("csrf_token=${session.csrfToken}"))
        assertTrue(!result.contains("HttpOnly"))
        verify(responseCookieBuilder).httpOnly(false)
    }

    @Test
    fun `builds clean readable csrf cookie`() {
        val responseCookieBuilder = mock<ResponseCookie.ResponseCookieBuilder>()
        val cookieBuilder = mock<CookieBuilder>()
        whenever(cookieBuilder.clean(CsrfCookieBuilder.CSRF_COOKIE_NAME)).thenReturn(responseCookieBuilder)
        whenever(responseCookieBuilder.httpOnly(false)).thenReturn(responseCookieBuilder)
        whenever(responseCookieBuilder.build())
            .thenReturn(
                ResponseCookie
                    .from("csrf_token", "")
                    .maxAge(0)
                    .httpOnly(false)
                    .build(),
            )

        val result = CsrfCookieBuilder(cookieBuilder).buildCleanCookie()

        assertTrue(result.contains("csrf_token="))
        assertTrue(result.contains("Max-Age=0"))
        assertTrue(!result.contains("HttpOnly"))
        verify(responseCookieBuilder).httpOnly(false)
    }
}
