package com.forsetijudge.api.adapter.util.cookie

import com.forsetijudge.core.domain.model.ExecutionContext
import com.forsetijudge.core.port.dto.response.session.SessionResponseBodyDTO
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class SessionCookieBuilder(
    private val cookieBuilder: CookieBuilder,
) {
    companion object {
        private const val SESSION_COOKIE_NAME = "session_id"
    }

    /**
     * Builds a session cookie string for the given session.
     *
     * @param session The session for which to build the cookie.
     * @return The session cookie string.
     */
    fun buildCookie(session: SessionResponseBodyDTO): String =
        cookieBuilder
            .from(SESSION_COOKIE_NAME, session.id.toString())
            .maxAge(Duration.between(ExecutionContext.get().startedAt, session.expiresAt))
            .build()
            .toString()

    /**
     * Builds a cookie string that clears the session cookie.
     *
     * @return The clear session cookie string.
     */
    fun buildCleanCookie(): String =
        cookieBuilder
            .clean(SESSION_COOKIE_NAME)
            .build()
            .toString()
}
