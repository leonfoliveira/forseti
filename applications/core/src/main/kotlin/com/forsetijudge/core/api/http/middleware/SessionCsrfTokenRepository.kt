package com.forsetijudge.core.api.http.middleware

import com.forsetijudge.core.api.util.SessionCookieBuilder
import com.forsetijudge.core.domain.exception.UnauthorizedException
import com.forsetijudge.core.port.input.usecase.session.FindSessionByIdUseCase
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.security.web.csrf.CsrfTokenRepository
import org.springframework.security.web.csrf.DefaultCsrfToken
import org.springframework.stereotype.Component
import org.springframework.web.util.WebUtils
import java.util.UUID

/**
 * Resolves the expected CSRF token from the server-side session identified by the "session_id"
 * cookie, so the client only has to send the token in the "X-CSRF-TOKEN" header.
 *
 * The token is never trusted from anything the client controls besides the header being validated:
 * a client-writable "csrf_token" cookie plays no role in validation. Token issuance and clearing
 * stay under application control as part of the sign-in / sign-out flows, so [saveToken] is a no-op.
 */
@Component
class SessionCsrfTokenRepository(
    private val findSessionByIdUseCase: FindSessionByIdUseCase,
) : CsrfTokenRepository {
    companion object {
        private const val HEADER_NAME = "X-CSRF-TOKEN"
        private const val PARAMETER_NAME = "_csrf"
    }

    /**
     * Generates a token for requests without a valid session. It is never persisted nor matches
     * anything the client can know, so such requests fail CSRF validation.
     *
     * @param request The current request.
     * @return The generated CSRF token.
     */
    override fun generateToken(request: HttpServletRequest): CsrfToken =
        loadToken(request) ?: DefaultCsrfToken(HEADER_NAME, PARAMETER_NAME, UUID.randomUUID().toString())

    /**
     * No-op: the token is created together with the session by the authentication flow.
     */
    override fun saveToken(
        token: CsrfToken?,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ) {
    }

    /**
     * Loads the CSRF token stored in the session referenced by the "session_id" cookie.
     *
     * @param request The current request.
     * @return The session's CSRF token, or null if there is no valid session.
     */
    override fun loadToken(request: HttpServletRequest): CsrfToken? {
        val sessionId =
            WebUtils.getCookie(request, SessionCookieBuilder.SESSION_COOKIE_NAME)?.value?.let {
                runCatching { UUID.fromString(it) }.getOrNull()
            } ?: return null

        val session =
            try {
                findSessionByIdUseCase.execute(FindSessionByIdUseCase.Command(sessionId = sessionId))
            } catch (_: UnauthorizedException) {
                return null
            }
        return DefaultCsrfToken(HEADER_NAME, PARAMETER_NAME, session.csrfToken.toString())
    }
}
