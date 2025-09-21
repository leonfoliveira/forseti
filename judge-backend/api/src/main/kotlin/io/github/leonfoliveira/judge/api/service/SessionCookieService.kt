package io.github.leonfoliveira.judge.api.service

import io.github.leonfoliveira.judge.common.domain.entity.Session
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseCookie
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.OffsetDateTime

@Service
class SessionCookieService(
    @Value("\${security.cookie.domain}")
    val cookieDomain: String,
    @Value("\${security.cookie.secure}")
    private val cookieSecure: Boolean,
) {
    fun buildCookie(session: Session): String {
        val cookie =
            ResponseCookie
                .from("session_id", session.id.toString())
                .domain(cookieDomain)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(Duration.between(OffsetDateTime.now(), session.expiresAt))
                .sameSite("None")
                .build()
        return cookie.toString()
    }

    fun buildClearCookie(): String {
        val cookie =
            ResponseCookie
                .from("session_id", "")
                .domain(cookieDomain)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build()
        return cookie.toString()
    }
}
