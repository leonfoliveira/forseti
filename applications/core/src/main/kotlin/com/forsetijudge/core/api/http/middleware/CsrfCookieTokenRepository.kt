package com.forsetijudge.core.api.http.middleware

import com.forsetijudge.core.api.util.CsrfCookieBuilder
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.security.web.csrf.CsrfTokenRepository
import org.springframework.security.web.csrf.DefaultCsrfToken
import org.springframework.stereotype.Component
import org.springframework.web.util.WebUtils
import java.util.UUID

/**
 * Reads the CSRF token from the "csrf_token" cookie written by the authentication controllers
 * (see [CsrfCookieBuilder]) instead of generating and persisting its own token.
 *
 * Token issuance, rotation and clearing stay entirely under application control as part of the
 * sign-in / sign-out flows; this repository only teaches Spring Security how to find the
 * current token so [org.springframework.security.web.csrf.CsrfFilter] can validate incoming
 * requests against it. [saveToken] is intentionally a no-op for this reason.
 */
@Component
class CsrfCookieTokenRepository : CsrfTokenRepository {
    companion object {
        private const val HEADER_NAME = "X-CSRF-TOKEN"
        private const val PARAMETER_NAME = "_csrf"
    }

    /**
     * Generates a token to be used when none is present yet, e.g. for requests that
     * (unexpectedly) reach a protected route without a "csrf_token" cookie. It never gets
     * persisted, so such requests will simply fail CSRF validation instead of authenticating.
     *
     * @param request The current request.
     * @return The generated CSRF token.
     */
    override fun generateToken(request: HttpServletRequest): CsrfToken =
        loadToken(request) ?: DefaultCsrfToken(HEADER_NAME, PARAMETER_NAME, UUID.randomUUID().toString())

    /**
     * No-op: the "csrf_token" cookie is written by the authentication controllers, not by
     * Spring Security.
     */
    override fun saveToken(
        token: CsrfToken?,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ) {
    }

    /**
     * Loads the CSRF token from the "csrf_token" cookie, if present.
     *
     * @param request The current request.
     * @return The CSRF token read from the cookie, or null if the cookie is not present.
     */
    override fun loadToken(request: HttpServletRequest): CsrfToken? {
        val value = WebUtils.getCookie(request, CsrfCookieBuilder.CSRF_COOKIE_NAME)?.value
        if (value.isNullOrBlank()) {
            return null
        }
        return DefaultCsrfToken(HEADER_NAME, PARAMETER_NAME, value)
    }
}
