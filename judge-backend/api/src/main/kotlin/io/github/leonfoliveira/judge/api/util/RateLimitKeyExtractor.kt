package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class RateLimitKeyExtractor {
    
    /**
     * Extracts the rate limiting key based on the specified key type.
     */
    fun extractKey(request: HttpServletRequest, keyType: KeyType): String {
        return when (keyType) {
            KeyType.IP_ADDRESS -> getClientIpAddress(request)
            KeyType.USER_ID -> getUserId() ?: getClientIpAddress(request)
            KeyType.IP_AND_USER -> {
                val ip = getClientIpAddress(request)
                val userId = getUserId()
                if (userId != null) "${ip}_${userId}" else ip
            }
        }
    }
    
    /**
     * Extracts the real client IP address, considering proxy headers.
     */
    private fun getClientIpAddress(request: HttpServletRequest): String {
        val xForwardedForHeader = request.getHeader("X-Forwarded-For")
        return when {
            !xForwardedForHeader.isNullOrBlank() -> {
                // X-Forwarded-For may contain multiple IPs, take the first one
                xForwardedForHeader.split(",").first().trim()
            }
            !request.getHeader("X-Real-IP").isNullOrBlank() -> {
                request.getHeader("X-Real-IP")
            }
            else -> request.remoteAddr ?: "unknown"
        }
    }
    
    /**
     * Gets the authenticated user ID from the security context.
     */
    private fun getUserId(): String? {
        val authentication = SecurityContextHolder.getContext().authentication as? JwtAuthentication
        return authentication?.principal?.member?.id?.toString()
    }
}
