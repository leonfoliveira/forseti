package io.github.leonfoliveira.judge.api.security.http

import io.github.leonfoliveira.judge.api.security.SessionAuthentication
import io.github.leonfoliveira.judge.api.service.RateLimitService
import io.github.leonfoliveira.judge.api.util.RateLimit
import io.github.leonfoliveira.judge.api.util.SessionUtil
import io.github.leonfoliveira.judge.common.domain.entity.Member
import io.github.leonfoliveira.judge.common.domain.exception.TooManyRequestsException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.method.HandlerMethod
import org.springframework.web.servlet.HandlerInterceptor

@Component
class HttpRateLimitInterceptor(
    private val rateLimitService: RateLimitService,
) : HandlerInterceptor {
    private val logger = LoggerFactory.getLogger(this::class.java)

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
    ): Boolean {
        logger.info("Started HttpRateLimitInterceptor for path: ${request.requestURI}")
        if (handler !is HandlerMethod) {
            logger.info("Handler is not a HandlerMethod, skipping rate limiting")
            return true
        }

        val auth = SecurityContextHolder.getContext().authentication as? SessionAuthentication
        if (auth?.principal?.member?.type == Member.Type.ROOT) {
            logger.info("User is ROOT, bypassing rate limiting")
            return true
        }

        val rateLimitAnnotation = handler.getMethodAnnotation(RateLimit::class.java)

        if (rateLimitAnnotation == null) {
            logger.info("No @RateLimit annotation found, skipping rate limiting")
            return true
        }

        val key = extractKey(request)
        logger.info("Checking rate limit for key: $key")
        val isAllowed =
            rateLimitService.tryConsume(
                key = key,
                requestsPerMinute = rateLimitAnnotation.perMinute,
                requestsPerHour = rateLimitAnnotation.perHour,
                burstCapacity = rateLimitAnnotation.burst,
            )

        if (!isAllowed) {
            logger.warn("Rate limit exceeded")
            setHeaders(response, key, rateLimitAnnotation)
            throw TooManyRequestsException()
        }

        logger.info("Rate limit check passed")
        return true
    }

    private fun extractKey(request: HttpServletRequest): String {
        val ipAddress = getClientIp(request)
        val member = SessionUtil.getCurrent()?.member

        if (member != null) {
            return "${member.id}_$ipAddress"
        }
        return ipAddress
    }

    private fun getClientIp(request: HttpServletRequest): String {
        val xfHeader = request.getHeader("X-Forwarded-For")
        return xfHeader?.split(",")?.first()?.trim() ?: request.remoteAddr ?: "unknown"
    }

    private fun setHeaders(
        response: HttpServletResponse,
        key: String,
        rateLimitAnnotation: RateLimit,
    ) {
        val availableTokens =
            rateLimitService.getAvailableTokens(
                key = key,
                requestsPerMinute = rateLimitAnnotation.perMinute,
                requestsPerHour = rateLimitAnnotation.perHour,
                burstCapacity = rateLimitAnnotation.burst,
            )

        response.setHeader("X-RateLimit-Limit-Minute", rateLimitAnnotation.perMinute.toString())
        response.setHeader("X-RateLimit-Limit-Hour", rateLimitAnnotation.perHour.toString())
        response.setHeader("X-RateLimit-Remaining", availableTokens.toString())
        response.setHeader("X-RateLimit-Reset", "60")
        response.setHeader("Retry-After", "60")
    }
}
