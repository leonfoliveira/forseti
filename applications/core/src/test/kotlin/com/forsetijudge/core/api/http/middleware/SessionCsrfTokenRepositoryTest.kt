package com.forsetijudge.core.api.http.middleware

import com.forsetijudge.core.api.util.SessionCookieBuilder
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.domain.model.Session
import com.forsetijudge.core.port.input.usecase.session.FindSessionByIdUseCase
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import org.springframework.mock.web.MockHttpServletRequest
import java.util.UUID

class SessionCsrfTokenRepositoryTest {
    private val findSessionByIdUseCase = mock<FindSessionByIdUseCase>()
    private val repository = SessionCsrfTokenRepository(findSessionByIdUseCase)

    @Test
    fun `loads token from the session`() {
        val csrfToken = UUID.randomUUID()
        val session = mock<Session> { on { this.csrfToken } doReturn csrfToken }
        whenever(findSessionByIdUseCase.execute(any())).thenReturn(session)

        val token = repository.loadToken(requestWithSession(UUID.randomUUID().toString()))

        assertEquals(csrfToken.toString(), token?.token)
        assertEquals("X-CSRF-TOKEN", token?.headerName)
        assertEquals("_csrf", token?.parameterName)
    }

    @Test
    fun `ignores the csrf cookie sent by the client`() {
        val csrfToken = UUID.randomUUID()
        val session = mock<Session> { on { this.csrfToken } doReturn csrfToken }
        whenever(findSessionByIdUseCase.execute(any())).thenReturn(session)
        val request = requestWithSession(UUID.randomUUID().toString())
        request.setCookies(*request.cookies, Cookie("csrf_token", "forged"))

        assertEquals(csrfToken.toString(), repository.loadToken(request)?.token)
    }

    @Test
    fun `returns null without a valid session cookie`() {
        assertNull(repository.loadToken(MockHttpServletRequest()))
        assertNull(repository.loadToken(requestWithSession("not-a-uuid")))
        verifyNoInteractions(findSessionByIdUseCase)
    }

    @Test
    fun `returns null when session is not found or expired`() {
        whenever(findSessionByIdUseCase.execute(any())).thenThrow(UnauthorizedException("nope"))

        assertNull(repository.loadToken(requestWithSession(UUID.randomUUID().toString())))
    }

    @Test
    fun `generates a random token when there is no session`() {
        val first = repository.generateToken(MockHttpServletRequest())
        val second = repository.generateToken(MockHttpServletRequest())

        assertNotEquals(first.token, second.token)
    }

    @Test
    fun `saving token does not modify response`() {
        val response = mock<HttpServletResponse>()

        repository.saveToken(null, MockHttpServletRequest(), response)

        verifyNoInteractions(response)
    }

    private fun requestWithSession(value: String) =
        MockHttpServletRequest().apply {
            setCookies(Cookie(SessionCookieBuilder.SESSION_COOKIE_NAME, value))
        }
}
