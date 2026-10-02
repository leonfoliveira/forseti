package com.forsetijudge.core.api.util

import com.forsetijudge.core.test.factory.MockModelFactory
import java.time.OffsetDateTime
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.http.ResponseCookie

class SessionCookieBuilderTest {
    @Test
    fun `builds session cookie from session id and expiry`() {
        val session = MockModelFactory.session(expiresAt = OffsetDateTime.now().plusSeconds(600))
        val responseCookieBuilder = mock<ResponseCookie.ResponseCookieBuilder>()
        val cookieBuilder = mock<CookieBuilder>()
        whenever(cookieBuilder.from(SessionCookieBuilder.SESSION_COOKIE_NAME, session.id.toString()))
            .thenReturn(responseCookieBuilder)
        whenever(responseCookieBuilder.maxAge(org.mockito.kotlin.any<java.time.Duration>()))
            .thenReturn(responseCookieBuilder)
        whenever(responseCookieBuilder.build())
            .thenReturn(ResponseCookie.from("session_id", session.id.toString()).maxAge(600).build())

        val result = SessionCookieBuilder(cookieBuilder).buildCookie(session)

        assertTrue(result.contains("session_id=${session.id}"))
        assertTrue(result.contains("Max-Age=600"))
    }

    @Test
    fun `builds clean session cookie`() {
        val cookieBuilder = mock<CookieBuilder>()
        whenever(cookieBuilder.clean(SessionCookieBuilder.SESSION_COOKIE_NAME))
            .thenReturn(ResponseCookie.from("session_id", "").maxAge(0))

        val result = SessionCookieBuilder(cookieBuilder).buildCleanCookie()

        assertTrue(result.startsWith("session_id=; Max-Age=0"))
    }
}
