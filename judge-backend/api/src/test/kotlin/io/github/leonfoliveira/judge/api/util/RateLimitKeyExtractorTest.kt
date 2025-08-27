package io.github.leonfoliveira.judge.api.util

import io.github.leonfoliveira.judge.api.security.JwtAuthentication
import io.github.leonfoliveira.judge.common.mock.entity.AuthorizationMockBuilder
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.unmockkStatic
import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.core.context.SecurityContextHolder

class RateLimitKeyExtractorTest : FunSpec({
    
    val keyExtractor = RateLimitKeyExtractor()
    
    beforeEach {
        mockkStatic(SecurityContextHolder::class)
    }
    
    afterEach {
        unmockkStatic(SecurityContextHolder::class)
    }
    
    test("should extract IP address when using IP_ADDRESS key type") {
        val request = mockk<HttpServletRequest>()
        every { request.getHeader("X-Forwarded-For") } returns null
        every { request.getHeader("X-Real-IP") } returns null
        every { request.remoteAddr } returns "192.168.1.1"
        
        val key = keyExtractor.extractKey(request, KeyType.IP_ADDRESS)
        key shouldBe "192.168.1.1"
    }
    
    test("should extract IP from X-Forwarded-For header") {
        val request = mockk<HttpServletRequest>()
        every { request.getHeader("X-Forwarded-For") } returns "203.0.113.1, 192.168.1.1"
        every { request.getHeader("X-Real-IP") } returns null
        
        val key = keyExtractor.extractKey(request, KeyType.IP_ADDRESS)
        key shouldBe "203.0.113.1"
    }
    
    test("should extract IP from X-Real-IP header when X-Forwarded-For is not available") {
        val request = mockk<HttpServletRequest>()
        every { request.getHeader("X-Forwarded-For") } returns null
        every { request.getHeader("X-Real-IP") } returns "203.0.113.2"
        every { request.remoteAddr } returns "192.168.1.1"
        
        val key = keyExtractor.extractKey(request, KeyType.IP_ADDRESS)
        key shouldBe "203.0.113.2"
    }
    
    test("should extract user ID when using USER_ID key type and user is authenticated") {
        val request = mockk<HttpServletRequest>()
        every { request.getHeader("X-Forwarded-For") } returns null
        every { request.getHeader("X-Real-IP") } returns null
        every { request.remoteAddr } returns "192.168.1.1"
        
        val authorization = AuthorizationMockBuilder.build()
        val authentication = JwtAuthentication(authorization)
        every { SecurityContextHolder.getContext().authentication } returns authentication
        
        val key = keyExtractor.extractKey(request, KeyType.USER_ID)
        key shouldBe authorization.member.id.toString()
    }
    
    test("should fallback to IP when using USER_ID key type but user is not authenticated") {
        val request = mockk<HttpServletRequest>()
        every { request.getHeader("X-Forwarded-For") } returns null
        every { request.getHeader("X-Real-IP") } returns null
        every { request.remoteAddr } returns "192.168.1.1"
        
        every { SecurityContextHolder.getContext().authentication } returns null
        
        val key = keyExtractor.extractKey(request, KeyType.USER_ID)
        key shouldBe "192.168.1.1"
    }
    
    test("should combine IP and user ID when using IP_AND_USER key type") {
        val request = mockk<HttpServletRequest>()
        every { request.getHeader("X-Forwarded-For") } returns null
        every { request.getHeader("X-Real-IP") } returns null
        every { request.remoteAddr } returns "192.168.1.1"
        
        val authorization = AuthorizationMockBuilder.build()
        val authentication = JwtAuthentication(authorization)
        every { SecurityContextHolder.getContext().authentication } returns authentication
        
        val key = keyExtractor.extractKey(request, KeyType.IP_AND_USER)
        key shouldContain "192.168.1.1"
        key shouldContain authorization.member.id.toString()
        key shouldContain "_"
    }
    
    test("should use only IP when using IP_AND_USER key type but user is not authenticated") {
        val request = mockk<HttpServletRequest>()
        every { request.getHeader("X-Forwarded-For") } returns null
        every { request.getHeader("X-Real-IP") } returns null
        every { request.remoteAddr } returns "192.168.1.1"
        
        every { SecurityContextHolder.getContext().authentication } returns null
        
        val key = keyExtractor.extractKey(request, KeyType.IP_AND_USER)
        key shouldBe "192.168.1.1"
    }
    
    test("should handle unknown IP gracefully") {
        val request = mockk<HttpServletRequest>()
        every { request.getHeader("X-Forwarded-For") } returns null
        every { request.getHeader("X-Real-IP") } returns null
        every { request.remoteAddr } returns null
        
        val key = keyExtractor.extractKey(request, KeyType.IP_ADDRESS)
        key shouldBe "unknown"
    }
})
