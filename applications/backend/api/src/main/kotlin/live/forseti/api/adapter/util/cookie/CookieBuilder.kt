package live.forseti.api.adapter.util.cookie

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseCookie
import org.springframework.stereotype.Service

@Service
class CookieBuilder(
    @Value("\${security.cookie.domain}")
    private val cookieDomain: String,
    @Value("\${security.cookie.secure}")
    private val cookieSecure: Boolean,
) {
    /**
     * Builds a cookie builder for the given key and value.
     *
     * @param key The cookie key.
     * @param value The cookie value.
     * @return The cookie builder.
     */
    fun from(
        key: String,
        value: String,
    ): ResponseCookie.ResponseCookieBuilder =
        if (cookieSecure) {
            ResponseCookie
                .from(key, value)
                .domain(cookieDomain)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
        } else {
            ResponseCookie
                .from(key, value)
                .httpOnly(true)
                .path("/")
                .sameSite("Lax")
        }

    /**
     * Builds a cookie builder that clears the cookie for the given key.
     *
     * @param key The cookie key.
     * @return The cookie builder that clears the cookie.
     */
    fun clean(key: String): ResponseCookie.ResponseCookieBuilder =
        if (cookieSecure) {
            ResponseCookie
                .from(key, "")
                .domain(cookieDomain)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
        } else {
            ResponseCookie
                .from(key, "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
        }
}
