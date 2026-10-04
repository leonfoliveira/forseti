package com.forsetijudge.core.api.http.middleware

import com.forsetijudge.core.api.util.CsrfCookieBuilder
import com.forsetijudge.core.api.util.SessionCookieBuilder
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.SessionAuthentication
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.input.usecase.session.FindSessionByIdUseCase
import jakarta.servlet.FilterChain
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpHeaders
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import java.util.UUID

class AuthenticationFilterTest {
    private val findSession = mock<FindSessionByIdUseCase>()
    private val sessionCookies = mock<SessionCookieBuilder>()
    private val csrfCookies = mock<CsrfCookieBuilder>()
    private val filter = AuthenticationFilter(findSession, sessionCookies, csrfCookies)

    @Test
    fun `continues unauthenticated when session cookie is absent`() {
        val response = MockHttpServletResponse()
        var chainCalled = false

        filter.doFilter(
            MockHttpServletRequest(),
            response,
            FilterChain { _, _ ->
                chainCalled = true
                assertNull(SecurityContextHolder.getContext().authentication)
            },
        )

        assertTrue(chainCalled)
        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `authenticates using resolved session and forwarded ip`() {
        val session = MockModelFactory.session()
        val request =
            requestWithSessionId(session.id.toString()).apply {
                addHeader("X-Forwarded-For", "203.0.113.10")
            }
        var authentication: SessionAuthentication? = null

        whenever(findSession.execute(FindSessionByIdUseCase.Command(session.id))).thenReturn(session)
        filter.doFilter(
            request,
            MockHttpServletResponse(),
            FilterChain { _, _ ->
                authentication = SecurityContextHolder.getContext().authentication as SessionAuthentication
            },
        )

        assertSame(session, authentication?.session)
        assertEquals("203.0.113.10", authentication?.ip)
        verify(findSession).execute(FindSessionByIdUseCase.Command(session.id))
        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `uses remote address when forwarded ip header is absent`() {
        val session = MockModelFactory.session()
        val request =
            requestWithSessionId(session.id.toString()).apply {
                remoteAddr = "192.0.2.15"
            }
        var authentication: SessionAuthentication? = null
        whenever(findSession.execute(FindSessionByIdUseCase.Command(session.id))).thenReturn(session)

        filter.doFilter(
            request,
            MockHttpServletResponse(),
            FilterChain { _, _ ->
                authentication = SecurityContextHolder.getContext().authentication as SessionAuthentication
            },
        )

        assertEquals("192.0.2.15", authentication?.ip)
    }

    @Test
    fun `clears cookies and throws when session id is malformed`() {
        whenever(sessionCookies.buildCleanCookie()).thenReturn("session_id=; Max-Age=0")
        whenever(csrfCookies.buildCleanCookie()).thenReturn("csrf_token=; Max-Age=0")
        val response = MockHttpServletResponse()

        assertThrows(UnauthorizedException::class.java) {
            filter.doFilter(
                requestWithSessionId("not-a-uuid"),
                response,
                FilterChain { _, _ -> throw AssertionError("Filter chain should not run") },
            )
        }

        val cookies = response.getHeaders(HttpHeaders.SET_COOKIE)
        assertEquals(2, cookies.size)
        assertTrue(cookies[0].startsWith("session_id=; Max-Age=0"))
        assertTrue(cookies[1].startsWith("csrf_token=; Max-Age=0"))
        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `clears cookies when session lookup rejects the session`() {
        val sessionId = UUID.randomUUID()
        whenever(findSession.execute(any())).thenThrow(UnauthorizedException())
        whenever(sessionCookies.buildCleanCookie()).thenReturn("session_id=; Max-Age=0")
        whenever(csrfCookies.buildCleanCookie()).thenReturn("csrf_token=; Max-Age=0")
        val response = MockHttpServletResponse()

        assertThrows(UnauthorizedException::class.java) {
            filter.doFilter(
                requestWithSessionId(sessionId.toString()),
                response,
                FilterChain { _, _ -> throw AssertionError("Filter chain should not run") },
            )
        }

        assertEquals(2, response.getHeaders(HttpHeaders.SET_COOKIE).size)
        assertFalse(SecurityContextHolder.getContext().authentication?.isAuthenticated ?: false)
    }

    @Test
    fun `clears security context when filter chain throws`() {
        val session = MockModelFactory.session()
        whenever(findSession.execute(eq(FindSessionByIdUseCase.Command(session.id)))).thenReturn(session)

        assertThrows(IllegalStateException::class.java) {
            filter.doFilter(
                requestWithSessionId(session.id.toString()),
                MockHttpServletResponse(),
                FilterChain { _, _ -> throw IllegalStateException("chain failure") },
            )
        }

        assertNull(SecurityContextHolder.getContext().authentication)
    }

    private fun requestWithSessionId(value: String) =
        MockHttpServletRequest().apply {
            setCookies(jakarta.servlet.http.Cookie(SessionCookieBuilder.SESSION_COOKIE_NAME, value))
        }
}
