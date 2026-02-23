package com.forsetijudge.api.adapter.util.cookie

import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class CsrfCookieBuilder(
    private val cookieBuilder: CookieBuilder,
) {
    companion object {
        private const val CSRF_COOKIE_NAME = "csrf_token"
    }

    /**
     * Builds a CSRF token cookie string for the given session.
     *
     * @param session The session for which to build the CSRF token cookie.
     * @return The CSRF token cookie string.
     */
    fun buildCookie(session: SessionResponseBodyDTO): String =
        cookieBuilder
            .from(CSRF_COOKIE_NAME, session.csrfToken.toString())
            .maxAge(Duration.between(ExecutionContext.getStartAt(), session.expiresAt))
            .httpOnly(false)
            .build()
            .toString()

    /**
     * Builds a cookie string that clears the CSRF token cookie.
     *
     * @return The clear CSRF token cookie string.
     */
    fun buildCleanCookie(): String =
        cookieBuilder
            .clean(CSRF_COOKIE_NAME)
            .httpOnly(false)
            .build()
            .toString()
}
