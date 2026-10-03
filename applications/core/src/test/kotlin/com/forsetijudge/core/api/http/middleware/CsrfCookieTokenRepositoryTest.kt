package com.forsetijudge.core.api.http.middleware

import com.forsetijudge.core.api.util.CsrfCookieBuilder
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.springframework.mock.web.MockHttpServletRequest

class CsrfCookieTokenRepositoryTest {
    private val repository = CsrfCookieTokenRepository()

    @Test
    fun `loads token from csrf cookie`() {
        val request = requestWithCookie("csrf-value")

        val token = repository.loadToken(request)

        assertEquals("csrf-value", token?.token)
        assertEquals("X-CSRF-TOKEN", token?.headerName)
        assertEquals("_csrf", token?.parameterName)
    }

    @Test
    fun `returns null when csrf cookie is missing or blank`() {
        assertNull(repository.loadToken(MockHttpServletRequest()))
        assertNull(repository.loadToken(requestWithCookie("")))
        assertNull(repository.loadToken(requestWithCookie("  ")))
    }

    @Test
    fun `generates a token when cookie is absent and reuses cookie token when present`() {
        val generated = repository.generateToken(MockHttpServletRequest())
        val fromCookie = repository.generateToken(requestWithCookie("existing-token"))

        assertEquals("X-CSRF-TOKEN", generated.headerName)
        assertEquals("_csrf", generated.parameterName)
        assertTrue(generated.token.isNotBlank())
        assertEquals("existing-token", fromCookie.token)
        assertNotEquals(generated.token, repository.generateToken(MockHttpServletRequest()).token)
    }

    @Test
    fun `saving token does not modify response`() {
        val response = mock<HttpServletResponse>()

        repository.saveToken(null, MockHttpServletRequest(), response)

        org.mockito.kotlin.verifyNoInteractions(response)
    }

    private fun requestWithCookie(value: String) =
        MockHttpServletRequest().apply {
            setCookies(Cookie(CsrfCookieBuilder.CSRF_COOKIE_NAME, value))
        }
}
