package io.github.leonfoliveira.judge.api.service

import io.github.leonfoliveira.judge.common.domain.model.Authorization
import io.github.leonfoliveira.judge.common.service.authorization.AuthorizationService
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseCookie
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.OffsetDateTime

@Service
class AuthorizationCookieService(
    private val authorizationService: AuthorizationService,
    @Value("\${server.cors.secure-cookies}")
    private val secureCookies: Boolean,
) {
    fun buildCookie(authorization: Authorization): String {
        val accessToken = authorizationService.encodeToken(authorization)
        val cookie =
            ResponseCookie
                .from("access_token", accessToken)
                .httpOnly(true)
                .secure(secureCookies)
                .path("/")
                .maxAge(Duration.between(OffsetDateTime.now(), authorization.expiresAt))
                .sameSite("Lax")
                .build()
        return cookie.toString()
    }
}
