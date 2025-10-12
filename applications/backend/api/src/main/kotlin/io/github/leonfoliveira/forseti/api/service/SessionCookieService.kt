package io.github.leonfoliveira.forseti.api.service

import io.github.leonfoliveira.forseti.common.domain.entity.Session
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
            if (cookieSecure) {
                ResponseCookie
                    .from("session_id", session.id.toString())
                    .domain(cookieDomain)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(Duration.between(OffsetDateTime.now(), session.expiresAt))
                    .sameSite("None")
                    .build()
            } else {
                ResponseCookie
                    .from("session_id", session.id.toString())
                    .httpOnly(true)
                    .path("/")
                    .maxAge(Duration.between(OffsetDateTime.now(), session.expiresAt))
                    .sameSite("Lax")
                    .build()
            }
        return cookie.toString()
    }

    fun buildClearCookie(): String {
        val cookie =
            if (cookieSecure) {
                ResponseCookie
                    .from("session_id", "")
                    .domain(cookieDomain)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(0)
                    .sameSite("None")
                    .build()
            } else {
                ResponseCookie
                    .from("session_id", "")
                    .httpOnly(true)
                    .path("/")
                    .maxAge(0)
                    .sameSite("Lax")
                    .build()
            }
        return cookie.toString()
    }
}
