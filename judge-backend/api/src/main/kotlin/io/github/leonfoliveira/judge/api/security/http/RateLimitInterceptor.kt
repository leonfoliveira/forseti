package io.github.leonfoliveira.judge.api.security.http

import io.github.leonfoliveira.judge.api.service.RateLimitService
import io.github.leonfoliveira.judge.api.util.RateLimit
import io.github.leonfoliveira.judge.api.util.RateLimitKeyExtractor
import io.github.leonfoliveira.judge.common.domain.exception.TooManyRequestsException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.method.HandlerMethod
import org.springframework.web.servlet.HandlerInterceptor

@Component
class RateLimitInterceptor(
    private val rateLimitService: RateLimitService,
    private val keyExtractor: RateLimitKeyExtractor
) : HandlerInterceptor {
    
    private val logger = LoggerFactory.getLogger(this::class.java)
    
    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        logger.debug("Started RateLimitInterceptor for path: ${request.requestURI}")
        
        if (handler !is HandlerMethod) {
            logger.debug("Handler is not a HandlerMethod, skipping rate limiting")
            return true
        }
        
        // Check for @RateLimit annotation on method or class
        val rateLimitAnnotation = handler.getMethodAnnotation(RateLimit::class.java)
            ?: handler.beanType.getAnnotation(RateLimit::class.java)
        
        if (rateLimitAnnotation == null) {
            logger.debug("No @RateLimit annotation found, skipping rate limiting")
            return true
        }
        
        return checkRateLimit(request, response, rateLimitAnnotation)
    }
    
    private fun checkRateLimit(
        request: HttpServletRequest,
        response: HttpServletResponse,
        rateLimit: RateLimit
    ): Boolean {
        val key = keyExtractor.extractKey(request, rateLimit.keyType)
        
        logger.debug("Checking rate limit for key: $key")
        
        val allowed = rateLimitService.tryConsume(
            key = key,
            requestsPerMinute = rateLimit.requestsPerMinute,
            requestsPerHour = rateLimit.requestsPerHour,
            burstCapacity = rateLimit.burstCapacity
        )
        
        if (!allowed) {
            logger.warn("Rate limit exceeded for key: $key")
            
            // Add rate limit headers
            val availableTokens = rateLimitService.getAvailableTokens(
                key = key,
                requestsPerMinute = rateLimit.requestsPerMinute,
                requestsPerHour = rateLimit.requestsPerHour,
                burstCapacity = rateLimit.burstCapacity
            )
            
            response.setHeader("X-RateLimit-Limit-Minute", rateLimit.requestsPerMinute.toString())
            response.setHeader("X-RateLimit-Limit-Hour", rateLimit.requestsPerHour.toString())
            response.setHeader("X-RateLimit-Remaining", availableTokens.toString())
            response.setHeader("X-RateLimit-Reset", "60") // Seconds until reset
            response.setHeader("Retry-After", "60") // Seconds to wait before retrying
            
            throw TooManyRequestsException(
                message = "Rate limit exceeded. Try again in 60 seconds.",
                retryAfterSeconds = 60
            )
        }
        
        logger.debug("Rate limit check passed for key: $key")
        return true
    }
}
