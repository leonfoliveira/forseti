package com.forsetijudge.core.api.http.middleware

import com.forsetijudge.core.api.util.CsrfCookieBuilder
import com.forsetijudge.core.api.util.SessionCookieBuilder
import com.forsetijudge.core.domain.exception.ForbiddenException
import com.forsetijudge.core.domain.exception.NotFoundException
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.SessionAuthentication
import com.forsetijudge.core.factory.MockEntityFactory
import com.forsetijudge.core.factory.MockModelFactory
import com.forsetijudge.core.port.dto.response.contest.toResponseDTO
import com.forsetijudge.core.port.input.usecase.contest.FindContestByIdUseCase
import com.forsetijudge.core.port.input.usecase.contest.FindContestBySlugUseCase
import com.forsetijudge.core.port.input.usecase.session.FindSessionByIdUseCase
import jakarta.servlet.FilterChain
import java.util.UUID
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doAnswer
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder

class AuthenticationFilterTest {
    private val findContestBySlugUseCase = mock<FindContestBySlugUseCase>()
    private val findContestByIdUseCase = mock<FindContestByIdUseCase>()
    private val findSessionByIdUseCase = mock<FindSessionByIdUseCase>()
    private val sessionCookieBuilder = mock<SessionCookieBuilder>()
    private val csrfCookieBuilder = mock<CsrfCookieBuilder>()

    private val filter =
        AuthenticationFilter(
            findContestBySlugUseCase,
            findContestByIdUseCase,
            findSessionByIdUseCase,
            sessionCookieBuilder,
            csrfCookieBuilder,
        )

    @BeforeEach
    fun setUp() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `should continue without authentication when session cookie is absent`() {
        val request = request()
        val response = MockHttpServletResponse()
        val filterChain = mock<FilterChain>()

        filter.doFilter(request, response, filterChain)

        verify(filterChain).doFilter(request, response)
        verify(findSessionByIdUseCase, never()).execute(any())
        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `should authenticate request using valid session cookie`() {
        val sessionId = UUID.randomUUID()
        val forwardedIp = "192.0.2.10"
        val request = request(sessionId = sessionId.toString())
        request.addHeader("X-Forwarded-For", forwardedIp)

        val response = MockHttpServletResponse()
        val filterChain = mock<FilterChain>()
        var authenticationDuringChain: Authentication? = null

        whenever(findSessionByIdUseCase.execute(any())).thenReturn(MockModelFactory.session())

        doAnswer {
            authenticationDuringChain =
                SecurityContextHolder.getContext().authentication
            null
        }.whenever(filterChain).doFilter(any(), any())

        filter.doFilter(request, response, filterChain)

        verify(findSessionByIdUseCase).execute(
            FindSessionByIdUseCase.Command(sessionId = sessionId),
        )
        verify(filterChain).doFilter(request, response)

        val authentication =
            authenticationDuringChain as SessionAuthentication

        assertEquals(forwardedIp, authentication.ip)
        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `should reject invalid session ID and clear cookies`() {
        val request = request(sessionId = "invalid-session-id")
        val response = MockHttpServletResponse()
        val filterChain = mock<FilterChain>()

        val sessionCookie = "session_id=; Path=/; Max-Age=0"
        val csrfCookie = "csrf_token=; Path=/; Max-Age=0"

        whenever(sessionCookieBuilder.buildCleanCookie())
            .thenReturn(sessionCookie)
        whenever(csrfCookieBuilder.buildCleanCookie())
            .thenReturn(csrfCookie)

        assertThrows(UnauthorizedException::class.java) {
            filter.doFilter(request, response, filterChain)
        }

        verify(findSessionByIdUseCase, never()).execute(any())
        verify(sessionCookieBuilder).buildCleanCookie()
        verify(csrfCookieBuilder).buildCleanCookie()
        verify(filterChain, never()).doFilter(any(), any())

        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `should resolve contest by slug and authorize forwarded IP`() {
        val allowedContest = MockEntityFactory.contest(ipCIDRs = listOf("192.0.2.0/24"))

        val request =
            request(
                uri = "/v1/contests/slug/test-contest/problems",
                remoteAddr = "198.51.100.10",
            )
        request.addHeader("X-Forwarded-For", "192.0.2.42")

        val response = MockHttpServletResponse()
        val filterChain = mock<FilterChain>()

        whenever(findContestBySlugUseCase.execute(any()))
            .thenReturn(allowedContest.toResponseDTO())

        filter.doFilter(request, response, filterChain)

        verify(findContestBySlugUseCase).execute(
            FindContestBySlugUseCase.Command(slug = "test-contest"),
        )
        verify(findContestByIdUseCase, never()).execute(any())
        verify(filterChain).doFilter(request, response)
    }

    @Test
    fun `should resolve contest by ID and authorize request IP`() {
        val contestId = UUID.randomUUID()
        val allowedContest = MockEntityFactory.contest(ipCIDRs = listOf("192.0.2.0/24"))

        val request =
            request(
                uri = "/v1/contests/$contestId/problems",
                remoteAddr = "192.0.2.15",
            )
        val response = MockHttpServletResponse()
        val filterChain = mock<FilterChain>()

        whenever(findContestByIdUseCase.execute(any()))
            .thenReturn(allowedContest.toResponseDTO())

        filter.doFilter(request, response, filterChain)

        verify(findContestByIdUseCase).execute(
            FindContestByIdUseCase.Command(id = contestId),
        )
        verify(findContestBySlugUseCase, never()).execute(any())
        verify(filterChain).doFilter(request, response)
    }

    @Test
    fun `should reject request from unauthorized IP`() {
        val restrictedContest = MockEntityFactory.contest(ipCIDRs = listOf("192.0.2.0/24"))

        val request =
            request(
                uri = "/v1/contests/slug/test-contest/problems",
                remoteAddr = "198.51.100.10",
            )
        val response = MockHttpServletResponse()
        val filterChain = mock<FilterChain>()

        whenever(findContestBySlugUseCase.execute(any()))
            .thenReturn(restrictedContest.toResponseDTO())

        assertThrows(ForbiddenException::class.java) {
            filter.doFilter(request, response, filterChain)
        }

        verify(findContestBySlugUseCase).execute(any())
        verify(filterChain, never()).doFilter(any(), any())
        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `should reject malformed contest ID`() {
        val request =
            request(
                uri = "/v1/contests/not-a-uuid/problems",
            )
        val response = MockHttpServletResponse()
        val filterChain = mock<FilterChain>()

        assertThrows(NotFoundException::class.java) {
            filter.doFilter(request, response, filterChain)
        }

        verify(findContestByIdUseCase, never()).execute(any())
        verify(findContestBySlugUseCase, never()).execute(any())
        verify(filterChain, never()).doFilter(any(), any())
        verify(sessionCookieBuilder, never()).buildCleanCookie()
        verify(csrfCookieBuilder, never()).buildCleanCookie()
    }

    private fun request(
        uri: String = "/v1/health",
        remoteAddr: String = "127.0.0.1",
        sessionId: String? = null,
    ): MockHttpServletRequest =
        MockHttpServletRequest().apply {
            method = "GET"
            requestURI = uri
            this.remoteAddr = remoteAddr

            sessionId?.let {
                setCookies(
                    jakarta.servlet.http.Cookie(
                        SessionCookieBuilder.SESSION_COOKIE_NAME,
                        it,
                    ),
                )
            }
        }
}
