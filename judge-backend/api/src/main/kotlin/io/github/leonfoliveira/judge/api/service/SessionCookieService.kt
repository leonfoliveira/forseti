package io.github.leonfoliveira.judge.api.service

import io.github.leonfoliveira.judge.common.domain.entity.Session
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseCookie
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.OffsetDateTime

@Service
class SessionCookieService(
    @Value("\${server.cors.secure-cookies}")
    private val secureCookies: Boolean,
) {
    fun buildCookie(session: Session): String {
        val cookie =
            ResponseCookie
                .from("session_id", session.id.toString())
                .httpOnly(true)
                .secure(secureCookies)
                .path("/")
                .maxAge(Duration.between(OffsetDateTime.now(), session.expiresAt))
                .sameSite("Lax")
                .build()
        return cookie.toString()
    }

    fun buildClearCookie(): String {
        val cookie =
            ResponseCookie
                .from("session_id", "")
                .httpOnly(true)
                .secure(secureCookies)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build()
        return cookie.toString()
    }
}
